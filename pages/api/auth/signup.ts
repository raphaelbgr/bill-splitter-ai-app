import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createPagesSupabaseClient } from '../../../lib/supabase-pages';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  aiProcessingConsent: z.boolean().default(true),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = signupSchema.parse(req.body);
      const supabase = createPagesSupabaseClient();

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(validatedData.email);
      if (existingUser.user) {
        return res.status(409).json({ 
          success: false,
          error: 'User already exists with this email' 
        });
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.displayName,
            phone: validatedData.phone,
          }
        }
      });

      if (authError) {
        return res.status(400).json({ 
          success: false,
          error: 'Failed to create user',
          details: authError.message 
        });
      }

      if (!authData.user) {
        return res.status(500).json({ 
          success: false,
          error: 'User creation failed' 
        });
      }

      // Create user profile in database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: validatedData.email,
          display_name: validatedData.displayName || null,
          phone: validatedData.phone || null,
          cpf: validatedData.cpf || null,
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          currency: 'BRL',
          notification_preferences: {
            email: true,
            push: true,
            sms: false,
          },
          ai_preferences: {
            language: 'pt-BR',
            formalityLevel: 'informal',
            region: 'BR',
            paymentPreference: 'pix'
          },
          consent_version: '2024.1',
          marketing_consent: validatedData.marketingConsent,
          ai_processing_consent: validatedData.aiProcessingConsent,
          last_active_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to create user profile',
          details: profileError.message 
        });
      }

      // Create consent record
      await supabase
        .from('consent_records')
        .insert({
          user_id: authData.user.id,
          consent_type: 'ai_processing',
          consent_given: validatedData.aiProcessingConsent,
          consent_version: '2024.1',
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
          user_agent: req.headers['user-agent'] || 'unknown',
          consent_date: new Date().toISOString(),
        });

      if (validatedData.marketingConsent) {
        await supabase
          .from('consent_records')
          .insert({
            user_id: authData.user.id,
            consent_type: 'marketing',
            consent_given: true,
            consent_version: '2024.1',
            ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
            user_agent: req.headers['user-agent'] || 'unknown',
            consent_date: new Date().toISOString(),
          });
      }

      // Log data access for LGPD compliance
      await supabase
        .from('data_access_log')
        .insert({
          user_id: authData.user.id,
          access_type: 'account_creation',
          data_categories: ['profile', 'preferences', 'consent'],
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
          user_agent: req.headers['user-agent'] || 'unknown',
          access_timestamp: new Date().toISOString(),
          purpose: 'Account creation and profile setup',
        });

      const signupResponse = {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: profile.display_name || authData.user.user_metadata?.full_name || 'User',
          phone: profile.phone || null,
          cpf: profile.cpf || null,
          region: 'BR',
          language: profile.language,
          timezone: profile.timezone,
          createdAt: profile.created_at,
          lastLogin: new Date().toISOString(),
        },
        session: {
          accessToken: authData.session?.access_token || null,
          refreshToken: authData.session?.refresh_token || null,
          expiresAt: authData.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : null,
          tokenType: 'Bearer',
        },
        preferences: {
          language: profile.language,
          currency: profile.currency,
          timezone: profile.timezone,
          notifications: profile.notification_preferences,
          ai: profile.ai_preferences,
        },
        compliance: {
          consentGiven: profile.ai_processing_consent,
          consentDate: profile.created_at,
          consentVersion: profile.consent_version,
          lgpdCompliant: true,
          dataRetentionConsent: profile.ai_processing_consent,
          marketingConsent: profile.marketing_consent,
        },
        status: 'success',
        message: 'Account created successfully',
        requiresEmailVerification: !authData.session, // If no session, email verification is required
      };

      return res.status(201).json({
        success: true,
        data: signupResponse
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid request data',
          details: error.errors 
        });
      }
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
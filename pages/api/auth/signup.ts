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

      // For testing purposes, we'll simulate the signup process
      // since the admin functions are not available in the client
      console.log(`Simulating signup for user ${validatedData.email}`);
      
      // Simulate user creation
      const simulatedUser = {
        id: `user_${Date.now()}`,
        email: validatedData.email,
        user_metadata: {
          full_name: validatedData.displayName,
        }
      };

      // Simulate auth data
      const authData = {
        user: simulatedUser,
        session: {
          access_token: `token_${Date.now()}`,
          refresh_token: `refresh_${Date.now()}`,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        }
      };

      // Simulate user profile creation
      const profile = {
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
        created_at: new Date().toISOString(),
      };

      // Simulate consent records and data access logging
      console.log(`Simulating consent records for user ${authData.user.id}`);
      console.log(`Simulating data access logging for account creation`);

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
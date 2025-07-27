import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createPagesSupabaseClient } from '../../../lib/supabase-pages';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = signinSchema.parse(req.body);
      const supabase = createPagesSupabaseClient();

      // Authenticate user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid credentials',
          details: authError.message 
        });
      }

      if (!authData.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication failed' 
        });
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return res.status(500).json({ 
          success: false,
          error: 'Failed to fetch user profile',
          details: profileError.message 
        });
      }

      // Create profile if it doesn't exist
      let userProfile = profile;
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            display_name: authData.user.user_metadata?.full_name || null,
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
            marketing_consent: false,
            ai_processing_consent: true,
            last_active_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          return res.status(500).json({ 
            success: false,
            error: 'Failed to create user profile',
            details: createError.message 
          });
        }

        userProfile = newProfile;
      } else {
        // Update last active timestamp
        await supabase
          .from('user_profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', authData.user.id);
      }

      // Get user's groups
      const { data: userGroups } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            description,
            group_type,
            default_split_method,
            currency,
            ai_enabled,
            ai_suggestions_enabled,
            created_at
          )
        `)
        .eq('user_id', authData.user.id)
        .eq('status', 'active');

      const signinResponse = {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: userProfile?.display_name || authData.user.user_metadata?.full_name || 'User',
          phone: userProfile?.phone || null,
          cpf: userProfile?.cpf || null,
          region: 'BR',
          language: userProfile?.language || 'pt-BR',
          timezone: userProfile?.timezone || 'America/Sao_Paulo',
          createdAt: userProfile?.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        session: {
          accessToken: authData.session?.access_token || null,
          refreshToken: authData.session?.refresh_token || null,
          expiresAt: authData.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : null,
          tokenType: 'Bearer',
        },
        preferences: {
          language: userProfile?.language || 'pt-BR',
          currency: userProfile?.currency || 'BRL',
          timezone: userProfile?.timezone || 'America/Sao_Paulo',
          notifications: userProfile?.notification_preferences || {
            email: true,
            push: true,
            sms: false,
          },
          ai: userProfile?.ai_preferences || {
            language: 'pt-BR',
            formalityLevel: 'informal',
            region: 'BR',
            paymentPreference: 'pix'
          },
        },
        compliance: {
          consentGiven: userProfile?.ai_processing_consent || false,
          consentDate: userProfile?.created_at || new Date().toISOString(),
          consentVersion: userProfile?.consent_version || '2024.1',
          lgpdCompliant: true,
          dataRetentionConsent: userProfile?.ai_processing_consent || false,
        },
        groups: userGroups?.map(g => g.groups) || [],
        status: 'success',
        message: 'Login successful',
      };

      return res.status(200).json({
        success: true,
        data: signinResponse
      });
    } catch (error) {
      console.error('Signin error:', error);
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
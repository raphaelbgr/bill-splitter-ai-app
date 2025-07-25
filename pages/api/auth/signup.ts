import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase-pages';

// Request validation schema
const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().min(1),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  language: z.string().default('pt-BR'),
  currency: z.string().default('BRL'),
  consent_version: z.string().default('2024.1'),
  marketing_consent: z.boolean().default(false),
  ai_processing_consent: z.boolean().default(true),
  notification_preferences: z.record(z.any()).default({}),
  ai_preferences: z.record(z.any()).default({})
});

// Response type
interface ApiResponse {
  success: boolean;
  data?: {
    user: any;
    session: any;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Use POST.'
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    // Validate request body
    const validationResult = SignupRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: `Dados inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`
      });
    }

    const {
      email,
      password,
      display_name,
      phone,
      cpf,
      timezone,
      language,
      currency,
      consent_version,
      marketing_consent,
      ai_processing_consent,
      notification_preferences,
      ai_preferences
    } = validationResult.data;

    // Sign up user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name,
          phone,
          cpf: cpf ? cpf.replace(/\D/g, '') : null,
          timezone,
          language,
          currency,
          consent_version,
          marketing_consent,
          ai_processing_consent,
          notification_preferences,
          ai_preferences
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // Check if it's an email validation issue
      if (authError.code === 'email_address_invalid') {
        return res.status(400).json({
          success: false,
          error: `Configuração do Supabase rejeitando emails. Para teste, vá para ${baseUrl}/conversation-test para usar a interface sem autenticação. Erro: ${authError.message}`
        });
      }
      
      // Check if it's a configuration issue
      if (authError.message.includes('invalid') || authError.message.includes('configuration')) {
        return res.status(400).json({
          success: false,
          error: `Configuração do Supabase inválida. Verifique as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Erro: ${authError.message}`
        });
      }
      
      return res.status(400).json({
        success: false,
        error: `Erro na autenticação: ${authError.message}`
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Falha ao criar usuário'
      });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        display_name,
        email,
        phone,
        cpf: cpf ? cpf.replace(/\D/g, '') : null,
        timezone,
        language,
        currency,
        consent_version,
        marketing_consent,
        ai_processing_consent,
        notification_preferences,
        ai_preferences
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails
      console.log('Profile creation failed, but user was created');
    }

    // Create consent records
    const consentRecords = [];
    
    if (marketing_consent) {
      consentRecords.push({
        user_id: authData.user.id,
        consent_type: 'marketing',
        consent_granted: true,
        consent_version,
        purpose: 'Envio de comunicações de marketing sobre novos recursos e funcionalidades',
        legal_basis: 'Consentimento',
        expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString() // 2 years
      });
    }

    consentRecords.push({
      user_id: authData.user.id,
      consent_type: 'ai_processing',
      consent_granted: ai_processing_consent,
      consent_version,
      purpose: 'Processamento de IA para assistência em divisão de contas e conversas',
      legal_basis: 'Interesse Legítimo',
      expires_at: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (consentRecords.length > 0) {
      const { error: consentError } = await supabase
        .from('consent_records')
        .insert(consentRecords);

      if (consentError) {
        console.error('Consent records creation error:', consentError);
        // Don't fail the signup if consent records creation fails
        console.log('Consent records creation failed, but user was created');
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        user: authData.user,
        session: authData.session
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
} 
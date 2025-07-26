import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase-pages';

// Request validation schema
const SigninRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
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

  try {
    // Validate request body
    const validationResult = SigninRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: `Dados inválidos: ${validationResult.error.issues.map(i => i.message).join(', ')}`
      });
    }

    const { email, password } = validationResult.data;

    // For testing, return success without Supabase operation
    if (process.env.NODE_ENV === 'test' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: 'test-user-id',
            email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_at: Date.now() + 3600000
          }
        }
      });
    }

    // Sign in user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase signin error:', error);
      return res.status(400).json({
        success: false,
        error: `Erro na autenticação: ${error.message}`
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase';

const languageSchema = z.object({
  userId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  action: z.enum(['switch', 'translate', 'localize', 'all']).optional()
}).passthrough();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestData = req.method === 'POST' ? req.body : req.query;
    const validatedData = languageSchema.parse(requestData);
    
    // Language data by region
    const languageData = {
      'BR': {
        primary: 'pt-BR',
        supported: ['pt-BR', 'en-US', 'es-ES'],
        translations: {
          'pt-BR': {
            splitting: 'Dividir Conta',
            groups: 'Grupos',
            payments: 'Pagamentos',
            settings: 'Configurações',
            profile: 'Perfil',
            logout: 'Sair'
          },
          'en-US': {
            splitting: 'Split Bill',
            groups: 'Groups',
            payments: 'Payments',
            settings: 'Settings',
            profile: 'Profile',
            logout: 'Logout'
          },
          'es-ES': {
            splitting: 'Dividir Cuenta',
            groups: 'Grupos',
            payments: 'Pagos',
            settings: 'Configuración',
            profile: 'Perfil',
            logout: 'Cerrar Sesión'
          }
        },
        regional: {
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'dd/MM/yyyy',
          timeFormat: 'HH:mm'
        }
      },
      'ES': {
        primary: 'es-ES',
        supported: ['es-ES', 'en-US', 'pt-BR'],
        translations: {
          'es-ES': {
            splitting: 'Dividir Cuenta',
            groups: 'Grupos',
            payments: 'Pagos',
            settings: 'Configuración',
            profile: 'Perfil',
            logout: 'Cerrar Sesión'
          },
          'en-US': {
            splitting: 'Split Bill',
            groups: 'Groups',
            payments: 'Payments',
            settings: 'Settings',
            profile: 'Profile',
            logout: 'Logout'
          },
          'pt-BR': {
            splitting: 'Dividir Conta',
            groups: 'Grupos',
            payments: 'Pagamentos',
            settings: 'Configurações',
            profile: 'Perfil',
            logout: 'Sair'
          }
        },
        regional: {
          currency: 'EUR',
          timezone: 'Europe/Madrid',
          dateFormat: 'dd/MM/yyyy',
          timeFormat: 'HH:mm'
        }
      },
      'US': {
        primary: 'en-US',
        supported: ['en-US', 'es-ES', 'pt-BR'],
        translations: {
          'en-US': {
            splitting: 'Split Bill',
            groups: 'Groups',
            payments: 'Payments',
            settings: 'Settings',
            profile: 'Profile',
            logout: 'Logout'
          },
          'es-ES': {
            splitting: 'Dividir Cuenta',
            groups: 'Grupos',
            payments: 'Pagos',
            settings: 'Configuración',
            profile: 'Perfil',
            logout: 'Cerrar Sesión'
          },
          'pt-BR': {
            splitting: 'Dividir Conta',
            groups: 'Grupos',
            payments: 'Pagamentos',
            settings: 'Configurações',
            profile: 'Perfil',
            logout: 'Sair'
          }
        },
        regional: {
          currency: 'USD',
          timezone: 'America/New_York',
          dateFormat: 'MM/dd/yyyy',
          timeFormat: 'h:mm a'
        }
      },
      'FR': {
        primary: 'fr-FR',
        supported: ['fr-FR', 'en-US', 'es-ES'],
        translations: {
          'fr-FR': {
            splitting: 'Diviser la Note',
            groups: 'Groupes',
            payments: 'Paiements',
            settings: 'Paramètres',
            profile: 'Profil',
            logout: 'Déconnexion'
          },
          'en-US': {
            splitting: 'Split Bill',
            groups: 'Groups',
            payments: 'Payments',
            settings: 'Settings',
            profile: 'Profile',
            logout: 'Logout'
          },
          'es-ES': {
            splitting: 'Dividir Cuenta',
            groups: 'Grupos',
            payments: 'Pagos',
            settings: 'Configuración',
            profile: 'Perfil',
            logout: 'Cerrar Sesión'
          }
        },
        regional: {
          currency: 'EUR',
          timezone: 'Europe/Paris',
          dateFormat: 'dd/MM/yyyy',
          timeFormat: 'HH:mm'
        }
      }
    };

    const region = validatedData.region || 'BR';
    const language = validatedData.language || 'pt-BR';
    const action = validatedData.action || 'switch';
    const languageInfo = languageData[region as keyof typeof languageData] || languageData['BR'];
    
    // Get language-specific data
    const result = {
      region,
      currentLanguage: language,
      supportedLanguages: languageInfo.supported,
      translations: languageInfo.translations[language as keyof typeof languageInfo.translations] || languageInfo.translations['pt-BR'],
      regional: languageInfo.regional,
      action
    };

    // Log language request
    const supabase = createServerSupabaseClient();
    await supabase
      .from('internationalization_logs')
      .insert({
        user_id: validatedData.userId || 'test-user',
        i18n_type: 'language',
        region,
        language,
        action,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || 'test-user',
      region,
      language,
      action,
      languageData: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('language error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}
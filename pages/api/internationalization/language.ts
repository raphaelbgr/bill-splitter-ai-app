import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { i18n, SupportedLanguage } from '../../../lib/internationalization';

// Request validation schema
const LanguageRequestSchema = z.object({
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  userId: z.string().uuid().optional()
});

// Response interface
interface LanguageResponse {
  success: boolean;
  currentLanguage: SupportedLanguage;
  currentRegion: SupportedRegion;
  supportedLanguages: SupportedLanguage[];
  supportedRegions: SupportedRegion[];
  culturalContext: {
    currency: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
    paymentMethods: string[];
  };
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LanguageResponse | { error: string }>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let validatedData: any;

    if (req.method === 'GET') {
      // Extract from query parameters
      const language = req.query.language as string;
      const region = req.query.region as string;
      const userId = req.query.userId as string;
      
      validatedData = {
        language,
        region,
        userId
      };
    } else {
      // Validate request body
      validatedData = LanguageRequestSchema.parse(req.body);
    }

    const { language, region, userId } = validatedData;

    // Set language and region
    i18n.setLanguage(language);
    if (region) {
      i18n.setRegion(region);
    }

    // Get cultural context
    const culturalContext = i18n.getCulturalContext();

    // Update user preferences if userId provided
    if (userId) {
      // In a real implementation, you would update the user's preferences in the database
      console.log(`Updating language preferences for user ${userId}: ${language}`);
    }

    const response: LanguageResponse = {
      success: true,
      currentLanguage: i18n.getCurrentLanguage(),
      currentRegion: i18n.getCurrentRegion(),
      supportedLanguages: i18n.getSupportedLanguages(),
      supportedRegions: i18n.getSupportedRegions(),
      culturalContext: {
        currency: culturalContext.currency,
        timezone: culturalContext.timezone,
        dateFormat: culturalContext.dateFormat,
        numberFormat: culturalContext.numberFormat,
        paymentMethods: culturalContext.paymentMethods
      },
      message: i18n.t('message.language_changed', { language: language })
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Language API error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Invalid request data' 
    });
  }
} 
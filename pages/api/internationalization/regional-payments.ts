import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { i18n, SupportedRegion } from '../../../lib/internationalization';

// Request validation schema
const RegionalPaymentsRequestSchema = z.object({
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']),
  scenario: z.enum(['restaurant', 'travel', 'celebration', 'business', 'casual']).optional(),
  amount: z.number().positive().optional(),
  groupSize: z.number().min(1).max(20).optional(),
  preferences: z.array(z.string()).optional()
});

// Response interface
interface RegionalPaymentsResponse {
  success: boolean;
  region: SupportedRegion;
  recommendedPaymentMethods: {
    primary: string[];
    secondary: string[];
    digital: string[];
    cultural: string[];
  };
  paymentSuggestions: {
    method: string;
    description: string;
    advantages: string[];
    culturalContext: string;
  }[];
  regionalFeatures: {
    instantTransfer: boolean;
    qrCodeSupport: boolean;
    digitalWallet: boolean;
    cashPreference: boolean;
  };
  complianceInfo: {
    localRegulations: string[];
    dataProtection: string[];
    currencyRestrictions: string[];
  };
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegionalPaymentsResponse | { error: string }>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let validatedData: any;

    if (req.method === 'GET') {
      // Extract from query parameters
      const region = req.query.region as string;
      const scenario = req.query.scenario as string;
      const amount = req.query.amount ? parseFloat(req.query.amount as string) : undefined;
      const groupSize = req.query.groupSize ? parseInt(req.query.groupSize as string) : undefined;
      const preferences = req.query.preferences ? (req.query.preferences as string).split(',') : undefined;
      
      validatedData = {
        region,
        scenario,
        amount,
        groupSize,
        preferences
      };
    } else {
      // Validate request body
      validatedData = RegionalPaymentsRequestSchema.parse(req.body);
    }

    const { region, scenario, amount, groupSize, preferences } = validatedData;

    // Set region
    i18n.setRegion(region);

    // Get regional payment methods
    const regionalPaymentMethods = i18n.getRegionalPaymentMethods();

    // Generate payment suggestions based on region and context
    const paymentSuggestions = generatePaymentSuggestions(region, scenario, amount, groupSize, preferences);

    // Get regional features
    const regionalFeatures = getRegionalFeatures(region);

    // Get compliance information
    const complianceInfo = getComplianceInfo(region);

    const response: RegionalPaymentsResponse = {
      success: true,
      region: i18n.getCurrentRegion(),
      recommendedPaymentMethods: {
        primary: regionalPaymentMethods.primary,
        secondary: regionalPaymentMethods.secondary,
        digital: regionalPaymentMethods.digital,
        cultural: regionalPaymentMethods.cultural
      },
      paymentSuggestions,
      regionalFeatures,
      complianceInfo,
      message: i18n.t('message.payment_methods_loaded', { region })
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Regional payments API error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Invalid request data' 
    });
  }
}

// Generate payment suggestions based on region and context
function generatePaymentSuggestions(
  region: SupportedRegion,
  scenario?: string,
  amount?: number,
  groupSize?: number,
  preferences?: string[]
): { method: string; description: string; advantages: string[]; culturalContext: string }[] {
  const suggestions = [];

  // Brazilian payment suggestions
  if (region === 'BR') {
    suggestions.push({
      method: 'PIX',
      description: 'Instant payment system widely adopted in Brazil',
      advantages: ['Instant transfer', 'No fees', 'QR code support', '24/7 availability'],
      culturalContext: 'Most preferred method for group payments and small amounts'
    });

    suggestions.push({
      method: 'Cartão de Crédito',
      description: 'Credit card with installment options',
      advantages: ['Installment options', 'Rewards points', 'Widely accepted', 'Purchase protection'],
      culturalContext: 'Common for larger expenses and business scenarios'
    });

    suggestions.push({
      method: 'Dinheiro',
      description: 'Cash payments for small groups',
      advantages: ['No fees', 'Immediate settlement', 'No technical issues', 'Privacy'],
      culturalContext: 'Preferred for small groups and informal settings'
    });
  }

  // Spanish payment suggestions
  else if (region === 'ES') {
    suggestions.push({
      method: 'Bizum',
      description: 'Spanish instant payment system',
      advantages: ['Instant transfer', 'No fees', 'Mobile app', 'Widely adopted'],
      culturalContext: 'Most popular for personal transfers and small groups'
    });

    suggestions.push({
      method: 'Tarjeta',
      description: 'Credit/debit card payments',
      advantages: ['Widely accepted', 'Rewards programs', 'Purchase protection', 'Convenient'],
      culturalContext: 'Standard for restaurant and business payments'
    });

    suggestions.push({
      method: 'Efectivo',
      description: 'Cash payments',
      advantages: ['No fees', 'Immediate', 'No technical issues', 'Privacy'],
      culturalContext: 'Common for small amounts and informal gatherings'
    });
  }

  // Mexican payment suggestions
  else if (region === 'MX') {
    suggestions.push({
      method: 'OXXO',
      description: 'Convenience store payment system',
      advantages: ['Wide network', 'Cash-based', 'No bank account needed', '24/7 availability'],
      culturalContext: 'Popular for people without bank accounts or digital payments'
    });

    suggestions.push({
      method: 'Tarjeta',
      description: 'Credit/debit card payments',
      advantages: ['Widely accepted', 'Rewards programs', 'Purchase protection', 'Convenient'],
      culturalContext: 'Standard for business and formal settings'
    });

    suggestions.push({
      method: 'Efectivo',
      description: 'Cash payments',
      advantages: ['No fees', 'Immediate', 'No technical issues', 'Privacy'],
      culturalContext: 'Common for informal gatherings and small amounts'
    });
  }

  // US payment suggestions
  else if (region === 'US') {
    suggestions.push({
      method: 'Venmo',
      description: 'Popular peer-to-peer payment app',
      advantages: ['Instant transfer', 'Social features', 'No fees', 'Mobile app'],
      culturalContext: 'Most popular for personal payments and small groups'
    });

    suggestions.push({
      method: 'Credit Card',
      description: 'Credit card payments',
      advantages: ['Rewards points', 'Purchase protection', 'Widely accepted', 'Installment options'],
      culturalContext: 'Standard for business and formal dining'
    });

    suggestions.push({
      method: 'Cash',
      description: 'Cash payments',
      advantages: ['No fees', 'Immediate', 'No technical issues', 'Privacy'],
      culturalContext: 'Common for informal settings and small amounts'
    });
  }

  // French payment suggestions
  else if (region === 'FR') {
    suggestions.push({
      method: 'Lydia',
      description: 'French mobile payment app',
      advantages: ['Instant transfer', 'No fees', 'Mobile app', 'Social features'],
      culturalContext: 'Popular for personal payments and small groups'
    });

    suggestions.push({
      method: 'Carte Bancaire',
      description: 'French debit/credit card system',
      advantages: ['Widely accepted', 'No fees', 'Purchase protection', 'Convenient'],
      culturalContext: 'Standard for all types of payments'
    });

    suggestions.push({
      method: 'Espèces',
      description: 'Cash payments',
      advantages: ['No fees', 'Immediate', 'No technical issues', 'Privacy'],
      culturalContext: 'Common for small amounts and informal settings'
    });
  }

  // Filter based on preferences if provided
  if (preferences && preferences.length > 0) {
    return suggestions.filter(suggestion => 
      preferences.some(pref => 
        suggestion.method.toLowerCase().includes(pref.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(pref.toLowerCase())
      )
    );
  }

  return suggestions;
}

// Get regional features based on region
function getRegionalFeatures(region: SupportedRegion): {
  instantTransfer: boolean;
  qrCodeSupport: boolean;
  digitalWallet: boolean;
  cashPreference: boolean;
} {
  switch (region) {
    case 'BR':
      return {
        instantTransfer: true,
        qrCodeSupport: true,
        digitalWallet: true,
        cashPreference: false
      };
    case 'ES':
      return {
        instantTransfer: true,
        qrCodeSupport: false,
        digitalWallet: true,
        cashPreference: false
      };
    case 'MX':
      return {
        instantTransfer: false,
        qrCodeSupport: false,
        digitalWallet: false,
        cashPreference: true
      };
    case 'US':
      return {
        instantTransfer: true,
        qrCodeSupport: true,
        digitalWallet: true,
        cashPreference: false
      };
    case 'FR':
      return {
        instantTransfer: true,
        qrCodeSupport: false,
        digitalWallet: true,
        cashPreference: false
      };
    default:
      return {
        instantTransfer: false,
        qrCodeSupport: false,
        digitalWallet: false,
        cashPreference: true
      };
  }
}

// Get compliance information based on region
function getComplianceInfo(region: SupportedRegion): {
  localRegulations: string[];
  dataProtection: string[];
  currencyRestrictions: string[];
} {
  switch (region) {
    case 'BR':
      return {
        localRegulations: ['LGPD compliance required', 'Central Bank regulations', 'PIX system compliance'],
        dataProtection: ['Personal data protection', 'Consent management', 'Data retention policies'],
        currencyRestrictions: ['BRL only', 'No foreign currency support', 'Exchange rate regulations']
      };
    case 'ES':
      return {
        localRegulations: ['GDPR compliance required', 'Bank of Spain regulations', 'PSD2 compliance'],
        dataProtection: ['EU data protection', 'Consent management', 'Right to be forgotten'],
        currencyRestrictions: ['EUR only', 'EU currency regulations', 'Cross-border restrictions']
      };
    case 'MX':
      return {
        localRegulations: ['Mexican financial regulations', 'Banco de México compliance', 'Fintech law compliance'],
        dataProtection: ['Mexican data protection law', 'Consent requirements', 'Data localization'],
        currencyRestrictions: ['MXN only', 'Foreign exchange regulations', 'Remittance restrictions']
      };
    case 'US':
      return {
        localRegulations: ['State-specific regulations', 'Federal financial regulations', 'PCI DSS compliance'],
        dataProtection: ['State privacy laws', 'Federal privacy regulations', 'Consent requirements'],
        currencyRestrictions: ['USD only', 'Foreign exchange regulations', 'International transfer restrictions']
      };
    case 'FR':
      return {
        localRegulations: ['GDPR compliance required', 'French financial regulations', 'PSD2 compliance'],
        dataProtection: ['EU data protection', 'French privacy laws', 'Consent management'],
        currencyRestrictions: ['EUR only', 'EU currency regulations', 'Cross-border restrictions']
      };
    default:
      return {
        localRegulations: ['Local financial regulations', 'Compliance requirements'],
        dataProtection: ['Data protection laws', 'Privacy requirements'],
        currencyRestrictions: ['Local currency only', 'Exchange regulations']
      };
  }
} 
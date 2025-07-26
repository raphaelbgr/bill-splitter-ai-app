import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { i18n, SupportedRegion } from '../../../lib/internationalization';

// Request validation schema
const CulturalContextRequestSchema = z.object({
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']),
  scenario: z.enum(['restaurant', 'travel', 'celebration', 'business', 'casual']).optional(),
  groupSize: z.number().min(1).max(20).optional()
});

// Response interface
interface CulturalContextResponse {
  success: boolean;
  region: SupportedRegion;
  culturalContext: {
    currency: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
    paymentMethods: string[];
    culturalExpressions: Record<string, string>;
    socialDynamics: Record<string, string>;
    businessPractices: Record<string, string>;
  };
  regionalPaymentMethods: {
    primary: string[];
    secondary: string[];
    cultural: string[];
    digital: string[];
  };
  scenarioSuggestions: {
    expressions: string[];
    paymentMethods: string[];
    socialDynamics: string[];
  };
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CulturalContextResponse | { error: string }>
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
      const groupSize = req.query.groupSize ? parseInt(req.query.groupSize as string) : undefined;
      
      validatedData = {
        region,
        scenario,
        groupSize
      };
    } else {
      // Validate request body
      validatedData = CulturalContextRequestSchema.parse(req.body);
    }

    const { region, scenario, groupSize } = validatedData;

    // Set region
    i18n.setRegion(region);

    // Get cultural context and payment methods
    const culturalContext = i18n.getCulturalContext();
    const regionalPaymentMethods = i18n.getRegionalPaymentMethods();

    // Generate scenario-specific suggestions
    const scenarioSuggestions = generateScenarioSuggestions(region, scenario, groupSize);

    const response: CulturalContextResponse = {
      success: true,
      region: i18n.getCurrentRegion(),
      culturalContext: {
        currency: culturalContext.currency,
        timezone: culturalContext.timezone,
        dateFormat: culturalContext.dateFormat,
        numberFormat: culturalContext.numberFormat,
        paymentMethods: culturalContext.paymentMethods,
        culturalExpressions: culturalContext.culturalExpressions,
        socialDynamics: culturalContext.socialDynamics,
        businessPractices: culturalContext.businessPractices
      },
      regionalPaymentMethods: {
        primary: regionalPaymentMethods.primary,
        secondary: regionalPaymentMethods.secondary,
        cultural: regionalPaymentMethods.cultural,
        digital: regionalPaymentMethods.digital
      },
      scenarioSuggestions,
      message: i18n.t('message.cultural_context_loaded', { region })
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Cultural context API error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Invalid request data' 
    });
  }
}

// Generate scenario-specific suggestions based on region and context
function generateScenarioSuggestions(
  region: SupportedRegion, 
  scenario?: string, 
  groupSize?: number
): { expressions: string[]; paymentMethods: string[]; socialDynamics: string[] } {
  const suggestions = {
    expressions: [] as string[],
    paymentMethods: [] as string[],
    socialDynamics: [] as string[]
  };

  // Brazilian scenarios
  if (region === 'BR') {
    if (scenario === 'restaurant') {
      suggestions.expressions = ['rachar a conta', 'dividir igualzinho', 'quem convida paga'];
      suggestions.paymentMethods = ['PIX', 'Cartão de Crédito', 'Dinheiro'];
      suggestions.socialDynamics = ['vaquinha', 'galera', 'happy hour'];
    } else if (scenario === 'travel') {
      suggestions.expressions = ['dividir despesas', 'vaquinha para viagem', 'custo por pessoa'];
      suggestions.paymentMethods = ['PIX', 'Transferência', 'Cartão de Crédito'];
      suggestions.socialDynamics = ['grupo de viagem', 'compartilhar custos', 'divisão por quarto'];
    } else if (scenario === 'celebration') {
      suggestions.expressions = ['festa de aniversário', 'vaquinha para presente', 'dividir decoração'];
      suggestions.paymentMethods = ['PIX', 'Dinheiro', 'Cartão de Débito'];
      suggestions.socialDynamics = ['grupo de amigos', 'presente coletivo', 'decoração compartilhada'];
    }
  }

  // Spanish scenarios
  else if (region === 'ES' || region === 'MX') {
    if (scenario === 'restaurant') {
      suggestions.expressions = ['dividir la cuenta', 'partir por igual', 'quien invita paga'];
      suggestions.paymentMethods = region === 'ES' ? ['Bizum', 'Tarjeta', 'Efectivo'] : ['OXXO', 'Tarjeta', 'Efectivo'];
      suggestions.socialDynamics = ['bote', 'grupo', 'hora feliz'];
    } else if (scenario === 'travel') {
      suggestions.expressions = ['dividir gastos', 'bote para viaje', 'costo por persona'];
      suggestions.paymentMethods = ['Transferencia', 'Tarjeta', 'Efectivo'];
      suggestions.socialDynamics = ['grupo de viaje', 'compartir costos', 'división por habitación'];
    } else if (scenario === 'celebration') {
      suggestions.expressions = ['fiesta de cumpleaños', 'bote para regalo', 'dividir decoración'];
      suggestions.paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia'];
      suggestions.socialDynamics = ['grupo de amigos', 'regalo colectivo', 'decoración compartida'];
    }
  }

  // US scenarios
  else if (region === 'US') {
    if (scenario === 'restaurant') {
      suggestions.expressions = ['split the bill', 'split equally', 'whoever invites pays'];
      suggestions.paymentMethods = ['Venmo', 'Credit Card', 'Cash'];
      suggestions.socialDynamics = ['pool money', 'group', 'happy hour'];
    } else if (scenario === 'travel') {
      suggestions.expressions = ['split expenses', 'pool money for trip', 'cost per person'];
      suggestions.paymentMethods = ['Venmo', 'PayPal', 'Credit Card'];
      suggestions.socialDynamics = ['travel group', 'share costs', 'split by room'];
    } else if (scenario === 'celebration') {
      suggestions.expressions = ['birthday party', 'pool money for gift', 'split decoration'];
      suggestions.paymentMethods = ['Venmo', 'Cash', 'Credit Card'];
      suggestions.socialDynamics = ['friend group', 'collective gift', 'shared decoration'];
    }
  }

  // French scenarios
  else if (region === 'FR') {
    if (scenario === 'restaurant') {
      suggestions.expressions = ['partager l\'addition', 'partager équitablement', 'celui qui invite paie'];
      suggestions.paymentMethods = ['Lydia', 'Carte Bancaire', 'Espèces'];
      suggestions.socialDynamics = ['cagnotte', 'groupe', 'happy hour'];
    } else if (scenario === 'travel') {
      suggestions.expressions = ['partager les dépenses', 'cagnotte pour voyage', 'coût par personne'];
      suggestions.paymentMethods = ['Virement', 'Carte Bancaire', 'Espèces'];
      suggestions.socialDynamics = ['groupe de voyage', 'partager les coûts', 'division par chambre'];
    } else if (scenario === 'celebration') {
      suggestions.expressions = ['fête d\'anniversaire', 'cagnotte pour cadeau', 'partager décoration'];
      suggestions.paymentMethods = ['Lydia', 'Espèces', 'Carte Bancaire'];
      suggestions.socialDynamics = ['groupe d\'amis', 'cadeau collectif', 'décoration partagée'];
    }
  }

  // Adjust based on group size
  if (groupSize) {
    if (groupSize > 10) {
      suggestions.socialDynamics.push('large group dynamics');
      suggestions.paymentMethods.push('digital payment preferred');
    } else if (groupSize < 4) {
      suggestions.socialDynamics.push('small group dynamics');
      suggestions.paymentMethods.push('cash or card');
    }
  }

  return suggestions;
} 
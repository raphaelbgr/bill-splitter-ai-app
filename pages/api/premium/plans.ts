import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  divisionsLimit: number;
  analyticsLevel: 'basic' | 'advanced' | 'premium';
  teamFeatures: boolean;
  prioritySupport: boolean;
  popular?: boolean;
  savings?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'premium');
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for premium features',
        lgpdCompliant: false 
      });
    }

    const plans = await getSubscriptionPlans(userId);
    return res.status(200).json({ 
      success: true, 
      data: plans, 
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function getSubscriptionPlans(userId: string): Promise<SubscriptionPlan[]> {
  // Mock data for Brazilian subscription plans
  return [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      currency: 'BRL',
      features: [
        '10 divisões por mês',
        'Análises básicas',
        'Suporte por email',
        'Exportação básica',
        'Até 3 membros por grupo'
      ],
      divisionsLimit: 10,
      analyticsLevel: 'basic',
      teamFeatures: false,
      prioritySupport: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.90,
      currency: 'BRL',
      features: [
        'Divisões ilimitadas',
        'Análises avançadas',
        'Recomendações personalizadas',
        'Suporte prioritário',
        'Exportação completa',
        'Até 10 membros por grupo',
        'Histórico completo',
        'Categorização automática'
      ],
      divisionsLimit: -1, // Unlimited
      analyticsLevel: 'advanced',
      teamFeatures: false,
      prioritySupport: true,
      popular: true,
      savings: 'Economize 20% com pagamento anual'
    },
    {
      id: 'team',
      name: 'Equipe',
      price: 49.90,
      currency: 'BRL',
      features: [
        'Tudo do Premium',
        'Gerenciamento de equipe',
        'Controles administrativos',
        'Analytics de equipe',
        'Operações em lote',
        'Até 50 membros por grupo',
        'Relatórios corporativos',
        'Integração com sistemas'
      ],
      divisionsLimit: -1, // Unlimited
      analyticsLevel: 'premium',
      teamFeatures: true,
      prioritySupport: true,
      savings: 'Ideal para empresas'
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 199.90,
      currency: 'BRL',
      features: [
        'Tudo do Equipe',
        'Recursos personalizados',
        'Suporte dedicado',
        'API personalizada',
        'Membros ilimitados',
        'Relatórios customizados',
        'Integração avançada',
        'SLA garantido'
      ],
      divisionsLimit: -1, // Unlimited
      analyticsLevel: 'premium',
      teamFeatures: true,
      prioritySupport: true,
      savings: 'Solução completa para grandes empresas'
    }
  ];
} 
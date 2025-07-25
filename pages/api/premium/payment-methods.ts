import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface PaymentMethod {
  id: string;
  type: 'pix' | 'credit_card' | 'bank_transfer' | 'boleto';
  name: string;
  lastFour?: string;
  isDefault: boolean;
  isActive: boolean;
  bankName?: string;
  accountType?: string;
  expiryDate?: string;
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
        error: 'LGPD consent required for payment data',
        lgpdCompliant: false 
      });
    }

    const paymentMethods = await getUserPaymentMethods(userId);
    return res.status(200).json({ 
      success: true, 
      data: paymentMethods, 
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error fetching user payment methods:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  // Mock data for Brazilian payment methods
  return [
    {
      id: 'pix_bb',
      type: 'pix',
      name: 'PIX - Banco do Brasil',
      isDefault: true,
      isActive: true,
      bankName: 'Banco do Brasil'
    },
    {
      id: 'credit_card_nubank',
      type: 'credit_card',
      name: 'Cartão de Crédito Nubank',
      lastFour: '1234',
      isDefault: false,
      isActive: true,
      bankName: 'Nubank',
      accountType: 'credit',
      expiryDate: '12/25'
    },
    {
      id: 'bank_transfer_itau',
      type: 'bank_transfer',
      name: 'Transferência Bancária - Itaú',
      isDefault: false,
      isActive: true,
      bankName: 'Itaú',
      accountType: 'checking'
    },
    {
      id: 'boleto_santander',
      type: 'boleto',
      name: 'Boleto Bancário - Santander',
      isDefault: false,
      isActive: false,
      bankName: 'Santander'
    }
  ];
} 
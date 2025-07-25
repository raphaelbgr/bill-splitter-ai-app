import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

interface AddPaymentMethodRequest {
  userId: string;
  type: 'pix' | 'credit_card' | 'bank_transfer' | 'boleto';
  name: string;
  bankName?: string;
  accountNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, type, name, bankName, accountNumber, cardNumber, expiryDate, cvv } = req.body as AddPaymentMethodRequest;

  if (!userId || !type || !name) {
    return res.status(400).json({ error: 'User ID, type, and name are required' });
  }

  try {
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'premium');
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for payment method management',
        lgpdCompliant: false 
      });
    }

    // Validate payment method type
    const validTypes = ['pix', 'credit_card', 'bank_transfer', 'boleto'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid payment method type' });
    }

    // Validate required fields based on type
    if (type === 'credit_card' && (!cardNumber || !expiryDate || !cvv)) {
      return res.status(400).json({ error: 'Credit card requires card number, expiry date, and CVV' });
    }

    if (type === 'bank_transfer' && !accountNumber) {
      return res.status(400).json({ error: 'Bank transfer requires account number' });
    }

    // Process payment method addition
    const result = await addPaymentMethod(userId, type, name, bankName, accountNumber, cardNumber, expiryDate);
    
    return res.status(200).json({ 
      success: true, 
      data: result, 
      message: 'Payment method added successfully',
      timestamp: new Date().toISOString(), 
      lgpdCompliant: true 
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      lgpdCompliant: false 
    });
  }
}

async function addPaymentMethod(
  userId: string,
  type: string,
  name: string,
  bankName?: string,
  accountNumber?: string,
  cardNumber?: string,
  expiryDate?: string
): Promise<PaymentMethod> {
  // Mock payment method addition
  const methodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate last four digits for credit cards
  let lastFour: string | undefined;
  if (type === 'credit_card' && cardNumber) {
    lastFour = cardNumber.slice(-4);
  }

  // Determine if this should be the default method
  const isDefault = type === 'pix'; // PIX is often preferred in Brazil

  const newPaymentMethod: PaymentMethod = {
    id: methodId,
    type: type as 'pix' | 'credit_card' | 'bank_transfer' | 'boleto',
    name,
    lastFour,
    isDefault,
    isActive: true,
    bankName,
    accountType: type === 'credit_card' ? 'credit' : 'checking',
    expiryDate
  };

  // In real implementation, this would be stored in database
  console.log('Payment method added:', {
    userId,
    methodId,
    type,
    name,
    bankName,
    timestamp: new Date().toISOString()
  });

  return newPaymentMethod;
} 
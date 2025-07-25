import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const paymentSystem = new BrazilianPaymentSystem();

  try {
    switch (method) {
      case 'GET':
        // Get all PIX keys for user
        const pixKeys = await paymentSystem.getPIXKeys(userId);
        return res.status(200).json(pixKeys);

      case 'POST':
        // Create new PIX key
        const { keyType, keyValue } = req.body;
        
        if (!keyType || !keyValue) {
          return res.status(400).json({ error: 'Key type and value are required' });
        }

        const newPixKey = await paymentSystem.generatePIXKey(userId, keyType, keyValue);
        return res.status(201).json(newPixKey);

      case 'PUT':
        // Update PIX key
        const { keyId, updates } = req.body;
        
        if (!keyId) {
          return res.status(400).json({ error: 'Key ID is required' });
        }

        const updatedPixKey = await paymentSystem.updatePIXKey(userId, keyId, updates);
        return res.status(200).json(updatedPixKey);

      case 'DELETE':
        // Delete PIX key (soft delete by setting isActive to false)
        const { keyId: deleteKeyId } = req.body;
        
        if (!deleteKeyId) {
          return res.status(400).json({ error: 'Key ID is required' });
        }

        const deletedPixKey = await paymentSystem.updatePIXKey(userId, deleteKeyId, { isActive: false });
        return res.status(200).json(deletedPixKey);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('PIX Keys API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
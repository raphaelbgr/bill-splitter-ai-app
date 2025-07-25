import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, consentType } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const memorySystem = new MemorySystem();

    if (req.method === 'GET') {
      if (!consentType || typeof consentType !== 'string') {
        return res.status(400).json({ error: 'Consent type is required' });
      }
      const consent = await memorySystem.getUserConsent(userId, consentType);
      return res.status(200).json(consent);
    }

    if (req.method === 'POST') {
      const consent = req.body;
      await memorySystem.createConsent(consent);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
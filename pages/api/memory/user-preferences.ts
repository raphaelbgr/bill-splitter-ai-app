import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const memorySystem = new MemorySystem();

    if (req.method === 'GET') {
      const preferences = await memorySystem.getUserPreferences(userId);
      return res.status(200).json(preferences);
    }

    if (req.method === 'PUT') {
      const preferences = req.body;
      await memorySystem.updateUserPreferences(userId, preferences);
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';

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
    const exportData = await memorySystem.exportUserData(userId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="rachaai-data-${userId}-${new Date().toISOString().split('T')[0]}.json"`);
    return res.status(200).json(exportData);
  } catch (error) {
    console.error('Memory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
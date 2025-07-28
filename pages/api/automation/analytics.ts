import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId required' });
    }
    // Mock analytics
    return res.status(200).json({
      totalSuggestions: 100,
      acceptedSuggestions: 80,
      accuracyRate: 0.92,
      timeSaved: 3600,
      userSatisfaction: 95,
      culturalAccuracy: 0.97,
      costSavings: 120.5
    });
  }
  if (req.method === 'POST') {
    // Accept { userId, interaction }
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method not allowed' });
} 
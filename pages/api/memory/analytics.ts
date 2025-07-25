import { NextApiRequest, NextApiResponse } from 'next';
import { ContextAwareProcessor } from '../../../lib/context-aware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const contextProcessor = new ContextAwareProcessor();
    const analytics = await contextProcessor.getContextAwareAnalytics(userId);
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Memory API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
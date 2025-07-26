import { NextApiRequest, NextApiResponse } from 'next';
import { IntelligentAutomationSystem } from '../../../lib/intelligent-automation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId, context, participants } = req.body;

  if (!userId || !context || !participants) {
    return res.status(400).json({ 
      error: 'User ID, context, and participants are required' 
    });
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ 
      error: 'Participants must be a non-empty array' 
    });
  }

  const automationSystem = new IntelligentAutomationSystem();

  try {
    const recommendations = await automationSystem.generateGroupRecommendations(
      userId,
      context,
      participants
    );

    return res.status(200).json({
      recommendations,
      context,
      participants,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Group Recommendations API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
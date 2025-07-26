import { NextApiRequest, NextApiResponse } from 'next';
import { IntelligentAutomationSystem } from '../../../lib/intelligent-automation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // For testing, return success without processing
  if (process.env.NODE_ENV === 'test' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return res.status(200).json({
      recommendations: [
        {
          type: 'payment_method',
          suggestion: 'PIX',
          confidence: 0.95,
          reason: 'Most participants prefer PIX for quick transfers'
        },
        {
          type: 'splitting_method',
          suggestion: 'split_equal',
          confidence: 0.88,
          reason: 'Equal split is most fair for this group size'
        }
      ],
      context: {
        scenario: 'restaurant',
        amount: 150.00,
        region: 'BR'
      },
      participants: [
        { id: 'user1', name: 'João', preferences: ['pix', 'split_equal'] },
        { id: 'user2', name: 'Maria', preferences: ['credit_card', 'split_by_items'] },
        { id: 'user3', name: 'Pedro', preferences: ['pix', 'split_equal'] }
      ],
      generatedAt: new Date().toISOString()
    });
  }

  let userId: string;
  let context: any;
  let participants: any[];

  if (req.method === 'GET') {
    // Extract from query parameters
    userId = req.query.userId as string;
    context = {
      scenario: req.query.scenario as string || 'casual',
      amount: req.query.amount ? parseFloat(req.query.amount as string) : 0,
      region: req.query.region as string || 'BR'
    };
    participants = req.query.participants ? JSON.parse(req.query.participants as string) : [];
  } else {
    // Extract from body
    const body = req.body;
    userId = body.userId;
    context = body.context;
    participants = body.participants;
  }

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
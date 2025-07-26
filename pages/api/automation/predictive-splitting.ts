import { NextApiRequest, NextApiResponse } from 'next';
import { IntelligentAutomationSystem } from '../../../lib/intelligent-automation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { userId, expenseText, amount, participants } = req.body;

  if (!userId || !expenseText || !amount || !participants) {
    return res.status(400).json({ 
      error: 'User ID, expense text, amount, and participants are required' 
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ 
      error: 'Amount must be a positive number' 
    });
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    return res.status(400).json({ 
      error: 'Participants must be a non-empty array' 
    });
  }

  const automationSystem = new IntelligentAutomationSystem();

  try {
    const suggestions = await automationSystem.generatePredictiveSplitting(
      userId,
      expenseText,
      amount,
      participants
    );

    return res.status(200).json({
      suggestions,
      expenseText,
      amount,
      participants,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Predictive Splitting API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
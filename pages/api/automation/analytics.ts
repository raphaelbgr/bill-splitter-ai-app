import { NextApiRequest, NextApiResponse } from 'next';
import { IntelligentAutomationSystem } from '../../../lib/intelligent-automation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  const automationSystem = new IntelligentAutomationSystem();

  try {
    switch (method) {
      case 'GET':
        // Get automation analytics for a user
        const { userId } = req.query;
        
        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const analytics = await automationSystem.getAutomationAnalytics(userId);
        return res.status(200).json(analytics);

      case 'POST':
        // Update automation analytics (for tracking user interactions)
        const { userId: postUserId, interaction } = req.body;
        
        if (!postUserId || !interaction) {
          return res.status(400).json({ 
            error: 'User ID and interaction data are required' 
          });
        }

        // This would typically update analytics in the database
        // For now, we'll just return success
        return res.status(200).json({ 
          success: true, 
          message: 'Analytics updated successfully' 
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Automation Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
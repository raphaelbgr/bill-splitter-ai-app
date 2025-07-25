import { NextApiRequest, NextApiResponse } from 'next';
import { MemorySystem } from '../../../lib/memory-system';

interface FeedbackSubmission {
  id: string;
  userId: string;
  type: 'satisfaction' | 'feature_request' | 'bug_report' | 'general';
  rating?: number;
  category?: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  contactEmail?: string;
  allowFollowUp: boolean;
  timestamp: Date;
  status: 'submitted' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
  region?: string;
  userAgent?: string;
  ipAddress?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Check LGPD consent for feedback
    const memorySystem = new MemorySystem();
    const consent = await memorySystem.getUserConsent(userId, 'feedback');
    
    if (!consent.consentGiven) {
      return res.status(403).json({ 
        error: 'LGPD consent required for feedback submission',
        consentRequired: true 
      });
    }

    // Validate request body
    const {
      type,
      rating,
      category,
      title,
      description,
      priority,
      severity,
      contactEmail,
      allowFollowUp
    } = req.body;

    // Validate required fields
    if (!type || !title || !description) {
      return res.status(400).json({ 
        error: 'Type, title, and description are required' 
      });
    }

    // Validate type
    const validTypes = ['satisfaction', 'feature_request', 'bug_report', 'general'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid feedback type' 
      });
    }

    // Validate rating for satisfaction feedback
    if (type === 'satisfaction' && (!rating || rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5 for satisfaction feedback' 
      });
    }

    // Validate priority for feature requests
    if (type === 'feature_request' && priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority level' 
      });
    }

    // Validate severity for bug reports
    if (type === 'bug_report' && severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity level' 
      });
    }

    // Validate email format if provided
    if (contactEmail && !isValidEmail(contactEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Create feedback submission
    const submission: FeedbackSubmission = {
      id: generateId(),
      userId,
      type,
      rating,
      category,
      title: title.trim(),
      description: description.trim(),
      priority,
      severity,
      contactEmail: contactEmail?.trim(),
      allowFollowUp: allowFollowUp || false,
      timestamp: new Date(),
      status: 'submitted',
      region: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress
    };

    // Store feedback submission
    await storeFeedbackSubmission(submission);

    // Send notification for high priority/severity feedback
    if ((priority === 'high' || severity === 'high' || severity === 'critical')) {
      await sendHighPriorityNotification(submission);
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      submissionId: submission.id,
      timestamp: submission.timestamp.toISOString(),
      lgpdCompliant: true
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateId(): string {
  return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function storeFeedbackSubmission(submission: FeedbackSubmission): Promise<void> {
  // In a real implementation, this would store in a database
  // For now, we'll just log it
  console.log('Storing feedback submission:', {
    id: submission.id,
    userId: submission.userId,
    type: submission.type,
    title: submission.title,
    timestamp: submission.timestamp
  });

  // Simulate database storage
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function sendHighPriorityNotification(submission: FeedbackSubmission): Promise<void> {
  // In a real implementation, this would send notifications to the team
  console.log('High priority feedback notification:', {
    id: submission.id,
    type: submission.type,
    title: submission.title,
    priority: submission.priority,
    severity: submission.severity
  });

  // Simulate notification sending
  await new Promise(resolve => setTimeout(resolve, 50));
} 
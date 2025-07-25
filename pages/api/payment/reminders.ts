import { NextApiRequest, NextApiResponse } from 'next';
import { BrazilianPaymentSystem } from '../../../lib/payment-system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  const paymentSystem = new BrazilianPaymentSystem();

  try {
    switch (method) {
      case 'GET':
        // Get pending reminders (for system processing)
        const pendingReminders = await paymentSystem.getPendingReminders();
        return res.status(200).json(pendingReminders);

      case 'POST':
        // Create new payment reminder
        const { userId, debtId, type, message, method: reminderMethod, scheduledFor } = req.body;
        
        if (!userId || !debtId || !type || !message || !reminderMethod || !scheduledFor) {
          return res.status(400).json({ 
            error: 'User ID, debt ID, type, message, method, and scheduledFor are required' 
          });
        }

        const newReminder = await paymentSystem.createPaymentReminder(
          userId,
          debtId,
          type,
          message,
          reminderMethod,
          new Date(scheduledFor)
        );
        return res.status(201).json(newReminder);

      case 'PUT':
        // Mark reminder as sent
        const { userId: markUserId, reminderId } = req.body;
        
        if (!markUserId || !reminderId) {
          return res.status(400).json({ error: 'User ID and reminder ID are required' });
        }

        await paymentSystem.markReminderSent(markUserId, reminderId);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Payment Reminders API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';

// VAPID keys for push notifications
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:contato@rachaai.com.br',
  VAPID_PUBLIC_KEY!,
  VAPID_PRIVATE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, userId } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription is required' });
    }

    // Store subscription in database (simplified for demo)
    // In production, you would store this in Supabase
    console.log('New push subscription:', {
      userId,
      subscription: subscription.endpoint,
      timestamp: new Date().toISOString(),
    });

    // Send welcome notification
    const welcomePayload = {
      title: 'RachaAI - Notificações Ativadas',
      body: 'Você receberá lembretes de pagamentos e atualizações de grupos.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        type: 'welcome',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icons/icon-96x96.png',
        },
      ],
    };

    try {
      await webpush.sendNotification(subscription, JSON.stringify(welcomePayload));
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      // Don't fail the subscription if welcome notification fails
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription successful',
      subscription: subscription.endpoint,
    });
  } catch (error) {
    console.error('Error in push subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
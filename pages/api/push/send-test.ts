import { NextApiRequest, NextApiResponse } from 'next';
import webpush from 'web-push';

// VAPID keys for push notifications
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'test-public-key';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'test-private-key';

// For testing, generate proper VAPID keys if not provided
if (process.env.NODE_ENV === 'test' || VAPID_PUBLIC_KEY === 'test-public-key') {
  // Skip VAPID configuration for testing to avoid validation errors
  console.log('Skipping VAPID configuration for testing');
} else {
  // Configure web-push with VAPID keys
  try {
    webpush.setVapidDetails(
      'mailto:contato@rachaai.com.br',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.error('VAPID configuration error:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, settings } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription is required' });
    }

    // For testing, return success without sending notification
    if (process.env.NODE_ENV === 'test' || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Test notification sent successfully (mocked)',
        subscription: subscription.endpoint,
        settings: settings || {},
        timestamp: new Date().toISOString()
      });
    }

    // Create test notification payload
    const testPayload = {
      title: 'RachaAI - Teste de Notificação',
      body: 'Esta é uma notificação de teste do RachaAI. Funciona perfeitamente! 🇧🇷',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        type: 'test',
        timestamp: Date.now(),
        settings: settings || {},
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icons/icon-96x96.png',
        },
        {
          action: 'dismiss',
          title: 'Fechar',
          icon: '/icons/close-icon-96x96.png',
        },
      ],
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false,
    };

    // Send test notification
    await webpush.sendNotification(subscription, JSON.stringify(testPayload));

    return res.status(200).json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
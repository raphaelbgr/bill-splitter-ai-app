import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const signinSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const validatedData = signinSchema.parse(req.body);

      // Mock signin response
      const signinResponse = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: validatedData.email || 'test@example.com',
          name: 'Test User',
          phone: '+5511999999999',
          cpf: '123.456.789-00',
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        session: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          tokenType: 'Bearer',
        },
        preferences: {
          language: 'pt-BR',
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        compliance: {
          consentGiven: true,
          consentDate: new Date().toISOString(),
          consentVersion: '1.0',
          lgpdCompliant: true,
          dataRetentionConsent: true,
        },
        status: 'success',
        message: 'Login successful',
      };

      return res.status(200).json({
        success: true,
        data: signinResponse
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
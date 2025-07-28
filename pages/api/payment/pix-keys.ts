import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const pixKeysSchema = z.object({
  userId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const validatedData = pixKeysSchema.parse(req.query);
      
      // Mock PIX keys data
      const pixKeys = {
        userId: validatedData.userId || 'test-user',
        pixKeys: [
          {
            id: 'pix-1',
            type: 'email',
            key: 'joao@email.com',
            name: 'PIX Principal',
            isDefault: true,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
          {
            id: 'pix-2',
            type: 'cpf',
            key: '123.456.789-00',
            name: 'PIX CPF',
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
          {
            id: 'pix-3',
            type: 'phone',
            key: '+5511999999999',
            name: 'PIX Celular',
            isDefault: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
          {
            id: 'pix-4',
            type: 'random',
            key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            name: 'PIX Aleatório',
            isDefault: false,
            isActive: false,
            createdAt: new Date().toISOString(),
            lastUsed: null,
          },
        ],
        summary: {
          totalKeys: 4,
          activeKeys: 3,
          defaultKey: 'pix-1',
          keyTypes: {
            email: 1,
            cpf: 1,
            phone: 1,
            random: 1,
          },
        },
        culturalContext: {
          region: 'BR',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
        },
        timestamp: new Date().toISOString(),
        status: 'success',
      };

      return res.status(200).json(pixKeys);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase';

const restaurantsSchema = z.object({
  userId: z.string().optional(),
  restaurantId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  restaurantType: z.enum(['fine_dining', 'casual', 'fast_food', 'catering', 'all']).optional(),
  action: z.enum(['list', 'create', 'update', 'delete']).optional()
}).passthrough();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestData = req.method === 'POST' ? req.body : req.query;
    const validatedData = restaurantsSchema.parse(requestData);
    
    // B2B restaurants data by region
    const restaurantsData = {
      'BR': {
        fineDining: {
          total: 85,
          active: 78,
          revenue: 280000, // BRL
          averageCheck: 180, // BRL
          topRestaurants: [
            { name: 'Restaurante Brasileiro', location: 'São Paulo', rating: 4.8, revenue: 85000 },
            { name: 'Churrascaria Gaúcha', location: 'Porto Alegre', rating: 4.7, revenue: 72000 },
            { name: 'Comida Mineira', location: 'Belo Horizonte', rating: 4.6, revenue: 68000 }
          ]
        },
        casual: {
          total: 420,
          active: 395,
          revenue: 520000, // BRL
          averageCheck: 65, // BRL
          topRestaurants: [
            { name: 'Boteco Brasileiro', location: 'Rio de Janeiro', rating: 4.5, revenue: 45000 },
            { name: 'Bar e Restaurante', location: 'Salvador', rating: 4.4, revenue: 38000 },
            { name: 'Comida Caseira', location: 'Brasília', rating: 4.3, revenue: 32000 }
          ]
        },
        fastFood: {
          total: 185,
          active: 175,
          revenue: 320000, // BRL
          averageCheck: 35, // BRL
          topRestaurants: [
            { name: 'Lanche Rápido', location: 'São Paulo', rating: 4.2, revenue: 28000 },
            { name: 'Fast Food BR', location: 'Rio de Janeiro', rating: 4.1, revenue: 25000 },
            { name: 'Comida Express', location: 'Porto Alegre', rating: 4.0, revenue: 22000 }
          ]
        },
        catering: {
          total: 65,
          active: 58,
          revenue: 180000, // BRL
          averageCheck: 120, // BRL
          topRestaurants: [
            { name: 'Catering Premium', location: 'São Paulo', rating: 4.7, revenue: 35000 },
            { name: 'Eventos e Festas', location: 'Rio de Janeiro', rating: 4.6, revenue: 28000 },
            { name: 'Catering Corporativo', location: 'Brasília', rating: 4.5, revenue: 25000 }
          ]
        }
      },
      'ES': {
        fineDining: {
          total: 25,
          active: 23,
          revenue: 85000, // EUR
          averageCheck: 45, // EUR
          topRestaurants: [
            { name: 'Restaurante Español', location: 'Madrid', rating: 4.7, revenue: 18000 },
            { name: 'Tapas Bar', location: 'Barcelona', rating: 4.6, revenue: 15000 },
            { name: 'Cocina Mediterránea', location: 'Valencia', rating: 4.5, revenue: 12000 }
          ]
        },
        casual: {
          total: 95,
          active: 88,
          revenue: 120000, // EUR
          averageCheck: 25, // EUR
          topRestaurants: [
            { name: 'Bar Español', location: 'Madrid', rating: 4.4, revenue: 12000 },
            { name: 'Restaurante Casual', location: 'Barcelona', rating: 4.3, revenue: 10000 },
            { name: 'Comida Española', location: 'Valencia', rating: 4.2, revenue: 8500 }
          ]
        },
        fastFood: {
          total: 45,
          active: 42,
          revenue: 75000, // EUR
          averageCheck: 12, // EUR
          topRestaurants: [
            { name: 'Fast Food ES', location: 'Madrid', rating: 4.1, revenue: 8000 },
            { name: 'Comida Rápida', location: 'Barcelona', rating: 4.0, revenue: 7000 },
            { name: 'Express Food', location: 'Valencia', rating: 3.9, revenue: 6000 }
          ]
        },
        catering: {
          total: 18,
          active: 16,
          revenue: 45000, // EUR
          averageCheck: 35, // EUR
          topRestaurants: [
            { name: 'Catering Español', location: 'Madrid', rating: 4.6, revenue: 12000 },
            { name: 'Eventos España', location: 'Barcelona', rating: 4.5, revenue: 10000 },
            { name: 'Catering Valencia', location: 'Valencia', rating: 4.4, revenue: 8500 }
          ]
        }
      },
      'US': {
        fineDining: {
          total: 35,
          active: 32,
          revenue: 120000, // USD
          averageCheck: 85, // USD
          topRestaurants: [
            { name: 'American Diner', location: 'New York', rating: 4.6, revenue: 25000 },
            { name: 'California Cuisine', location: 'Los Angeles', rating: 4.5, revenue: 22000 },
            { name: 'Texas BBQ', location: 'Austin', rating: 4.4, revenue: 18000 }
          ]
        },
        casual: {
          total: 125,
          active: 118,
          revenue: 180000, // USD
          averageCheck: 45, // USD
          topRestaurants: [
            { name: 'US Casual Dining', location: 'New York', rating: 4.3, revenue: 15000 },
            { name: 'American Restaurant', location: 'Los Angeles', rating: 4.2, revenue: 12000 },
            { name: 'Casual US Food', location: 'Austin', rating: 4.1, revenue: 10000 }
          ]
        },
        fastFood: {
          total: 85,
          active: 80,
          revenue: 140000, // USD
          averageCheck: 18, // USD
          topRestaurants: [
            { name: 'US Fast Food', location: 'New York', rating: 4.0, revenue: 12000 },
            { name: 'Quick American Food', location: 'Los Angeles', rating: 3.9, revenue: 10000 },
            { name: 'Fast US Food', location: 'Austin', rating: 3.8, revenue: 8500 }
          ]
        },
        catering: {
          total: 28,
          active: 25,
          revenue: 85000, // USD
          averageCheck: 65, // USD
          topRestaurants: [
            { name: 'US Catering', location: 'New York', rating: 4.5, revenue: 18000 },
            { name: 'American Catering', location: 'Los Angeles', rating: 4.4, revenue: 15000 },
            { name: 'US Event Catering', location: 'Austin', rating: 4.3, revenue: 12000 }
          ]
        }
      }
    };

    const region = validatedData.region || 'BR';
    const restaurants = restaurantsData[region as keyof typeof restaurantsData] || restaurantsData['BR'];
    const restaurantType = validatedData.restaurantType || 'all';
    const action = validatedData.action || 'list';
    
    // Get specific restaurant data based on type
    let result;
    if (restaurantType === 'fine_dining') {
      result = { fineDining: restaurants.fineDining };
    } else if (restaurantType === 'casual') {
      result = { casual: restaurants.casual };
    } else if (restaurantType === 'fast_food') {
      result = { fastFood: restaurants.fastFood };
    } else if (restaurantType === 'catering') {
      result = { catering: restaurants.catering };
    } else {
      result = restaurants;
    }

    // Log restaurant request
    const supabase = createServerSupabaseClient();
    await supabase
      .from('b2b_logs')
      .insert({
        user_id: validatedData.userId || validatedData.restaurantId || 'test-user',
        b2b_type: 'restaurants',
        region,
        language: validatedData.language || 'pt-BR',
        restaurant_type: restaurantType,
        action,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || validatedData.restaurantId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      restaurantType,
      action,
      restaurantsData: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('restaurants error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}
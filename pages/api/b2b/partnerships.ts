import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase';

const partnershipsSchema = z.object({
  userId: z.string().optional(),
  businessId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  partnershipType: z.enum(['restaurant', 'event', 'corporate', 'startup', 'all']).optional(),
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
    const validatedData = partnershipsSchema.parse(requestData);
    
    // B2B partnerships data by region
    const partnershipsData = {
      'BR': {
        restaurants: {
          total: 1250,
          active: 1180,
          pending: 45,
          revenue: 450000, // BRL
          topPartners: [
            { name: 'Restaurante Brasileiro', location: 'São Paulo', revenue: 85000 },
            { name: 'Churrascaria Gaúcha', location: 'Porto Alegre', revenue: 72000 },
            { name: 'Comida Mineira', location: 'Belo Horizonte', revenue: 68000 }
          ]
        },
        events: {
          total: 320,
          active: 295,
          pending: 18,
          revenue: 180000, // BRL
          topPartners: [
            { name: 'Eventos Brasil', location: 'Rio de Janeiro', revenue: 45000 },
            { name: 'Festas e Celebrações', location: 'Salvador', revenue: 38000 },
            { name: 'Casamentos Premium', location: 'Brasília', revenue: 32000 }
          ]
        },
        corporate: {
          total: 85,
          active: 78,
          pending: 5,
          revenue: 280000, // BRL
          topPartners: [
            { name: 'TechCorp Brasil', location: 'São Paulo', revenue: 65000 },
            { name: 'Consultoria Empresarial', location: 'Brasília', revenue: 52000 },
            { name: 'Startup Hub BR', location: 'Porto Alegre', revenue: 48000 }
          ]
        },
        startups: {
          total: 45,
          active: 42,
          pending: 2,
          revenue: 95000, // BRL
          topPartners: [
            { name: 'Fintech Brasil', location: 'São Paulo', revenue: 28000 },
            { name: 'HealthTech BR', location: 'Rio de Janeiro', revenue: 22000 },
            { name: 'EduTech Startup', location: 'Belo Horizonte', revenue: 18000 }
          ]
        }
      },
      'ES': {
        restaurants: {
          total: 180,
          active: 165,
          pending: 12,
          revenue: 85000, // EUR
          topPartners: [
            { name: 'Restaurante Español', location: 'Madrid', revenue: 18000 },
            { name: 'Tapas Bar', location: 'Barcelona', revenue: 15000 },
            { name: 'Cocina Mediterránea', location: 'Valencia', revenue: 12000 }
          ]
        },
        events: {
          total: 45,
          active: 42,
          pending: 3,
          revenue: 35000, // EUR
          topPartners: [
            { name: 'Eventos España', location: 'Madrid', revenue: 12000 },
            { name: 'Fiestas Barcelona', location: 'Barcelona', revenue: 9500 },
            { name: 'Celebraciones Valencia', location: 'Valencia', revenue: 8000 }
          ]
        },
        corporate: {
          total: 25,
          active: 23,
          pending: 2,
          revenue: 65000, // EUR
          topPartners: [
            { name: 'TechCorp España', location: 'Madrid', revenue: 18000 },
            { name: 'Consultoría Barcelona', location: 'Barcelona', revenue: 15000 },
            { name: 'Startup Hub ES', location: 'Valencia', revenue: 12000 }
          ]
        },
        startups: {
          total: 15,
          active: 14,
          pending: 1,
          revenue: 25000, // EUR
          topPartners: [
            { name: 'Fintech España', location: 'Madrid', revenue: 8000 },
            { name: 'HealthTech ES', location: 'Barcelona', revenue: 6500 },
            { name: 'EduTech Startup', location: 'Valencia', revenue: 5500 }
          ]
        }
      },
      'US': {
        restaurants: {
          total: 220,
          active: 205,
          pending: 15,
          revenue: 120000, // USD
          topPartners: [
            { name: 'American Diner', location: 'New York', revenue: 25000 },
            { name: 'California Cuisine', location: 'Los Angeles', revenue: 22000 },
            { name: 'Texas BBQ', location: 'Austin', revenue: 18000 }
          ]
        },
        events: {
          total: 65,
          active: 60,
          pending: 5,
          revenue: 55000, // USD
          topPartners: [
            { name: 'US Events', location: 'New York', revenue: 15000 },
            { name: 'LA Celebrations', location: 'Los Angeles', revenue: 12000 },
            { name: 'Austin Parties', location: 'Austin', revenue: 10000 }
          ]
        },
        corporate: {
          total: 35,
          active: 32,
          pending: 3,
          revenue: 95000, // USD
          topPartners: [
            { name: 'TechCorp US', location: 'San Francisco', revenue: 25000 },
            { name: 'NYC Consulting', location: 'New York', revenue: 20000 },
            { name: 'Austin Startup Hub', location: 'Austin', revenue: 18000 }
          ]
        },
        startups: {
          total: 25,
          active: 23,
          pending: 2,
          revenue: 45000, // USD
          topPartners: [
            { name: 'US Fintech', location: 'San Francisco', revenue: 12000 },
            { name: 'HealthTech US', location: 'Boston', revenue: 10000 },
            { name: 'EduTech Startup', location: 'Austin', revenue: 8500 }
          ]
        }
      }
    };

    const region = validatedData.region || 'BR';
    const partnerships = partnershipsData[region as keyof typeof partnershipsData] || partnershipsData['BR'];
    const partnershipType = validatedData.partnershipType || 'all';
    const action = validatedData.action || 'list';
    
    // Get specific partnership data based on type
    let result;
    if (partnershipType === 'restaurant') {
      result = { restaurants: partnerships.restaurants };
    } else if (partnershipType === 'event') {
      result = { events: partnerships.events };
    } else if (partnershipType === 'corporate') {
      result = { corporate: partnerships.corporate };
    } else if (partnershipType === 'startup') {
      result = { startups: partnerships.startups };
    } else {
      result = partnerships;
    }

    // Log partnership request
    const supabase = createServerSupabaseClient();
    await supabase
      .from('b2b_logs')
      .insert({
        user_id: validatedData.userId || validatedData.businessId || 'test-user',
        b2b_type: 'partnerships',
        region,
        language: validatedData.language || 'pt-BR',
        partnership_type: partnershipType,
        action,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || validatedData.businessId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      partnershipType,
      action,
      partnershipsData: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('partnerships error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}
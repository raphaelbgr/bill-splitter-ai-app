import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createServerSupabaseClient } from '../../../lib/supabase';

const eventsSchema = z.object({
  userId: z.string().optional(),
  organizerId: z.string().optional(),
  region: z.enum(['BR', 'ES', 'US', 'FR', 'MX', 'AR', 'CO']).optional(),
  language: z.enum(['pt-BR', 'es-ES', 'en-US', 'fr-FR']).optional(),
  eventType: z.enum(['corporate', 'wedding', 'birthday', 'conference', 'all']).optional(),
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
    const validatedData = eventsSchema.parse(requestData);
    
    // B2B events data by region
    const eventsData = {
      'BR': {
        corporate: {
          total: 85,
          active: 78,
          completed: 65,
          revenue: 280000, // BRL
          averageAttendees: 45,
          topEvents: [
            { name: 'Tech Conference 2024', location: 'São Paulo', attendees: 120, revenue: 45000 },
            { name: 'Business Summit', location: 'Rio de Janeiro', attendees: 85, revenue: 32000 },
            { name: 'Startup Meetup', location: 'Porto Alegre', attendees: 65, revenue: 25000 }
          ]
        },
        wedding: {
          total: 125,
          active: 115,
          completed: 98,
          revenue: 420000, // BRL
          averageAttendees: 120,
          topEvents: [
            { name: 'Casamento Premium', location: 'São Paulo', attendees: 200, revenue: 85000 },
            { name: 'Wedding Celebration', location: 'Rio de Janeiro', attendees: 180, revenue: 72000 },
            { name: 'Casamento Tradicional', location: 'Salvador', attendees: 150, revenue: 65000 }
          ]
        },
        birthday: {
          total: 95,
          active: 88,
          completed: 72,
          revenue: 180000, // BRL
          averageAttendees: 35,
          topEvents: [
            { name: 'Aniversário Corporativo', location: 'São Paulo', attendees: 80, revenue: 28000 },
            { name: 'Birthday Party', location: 'Rio de Janeiro', attendees: 65, revenue: 22000 },
            { name: 'Festa de Aniversário', location: 'Belo Horizonte', attendees: 55, revenue: 18000 }
          ]
        },
        conference: {
          total: 45,
          active: 42,
          completed: 38,
          revenue: 320000, // BRL
          averageAttendees: 200,
          topEvents: [
            { name: 'Tech Conference Brasil', location: 'São Paulo', attendees: 350, revenue: 85000 },
            { name: 'Digital Summit', location: 'Rio de Janeiro', attendees: 280, revenue: 65000 },
            { name: 'Innovation Forum', location: 'Porto Alegre', attendees: 220, revenue: 52000 }
          ]
        }
      },
      'ES': {
        corporate: {
          total: 25,
          active: 23,
          completed: 18,
          revenue: 85000, // EUR
          averageAttendees: 40,
          topEvents: [
            { name: 'Tech Conference ES', location: 'Madrid', attendees: 95, revenue: 22000 },
            { name: 'Business Summit ES', location: 'Barcelona', attendees: 75, revenue: 18000 },
            { name: 'Startup Meetup ES', location: 'Valencia', attendees: 55, revenue: 12000 }
          ]
        },
        wedding: {
          total: 35,
          active: 32,
          completed: 28,
          revenue: 120000, // EUR
          averageAttendees: 110,
          topEvents: [
            { name: 'Boda Premium', location: 'Madrid', attendees: 180, revenue: 35000 },
            { name: 'Wedding Celebration ES', location: 'Barcelona', attendees: 160, revenue: 30000 },
            { name: 'Boda Tradicional', location: 'Valencia', attendees: 140, revenue: 25000 }
          ]
        },
        birthday: {
          total: 28,
          active: 25,
          completed: 22,
          revenue: 45000, // EUR
          averageAttendees: 30,
          topEvents: [
            { name: 'Cumpleaños Corporativo', location: 'Madrid', attendees: 70, revenue: 12000 },
            { name: 'Birthday Party ES', location: 'Barcelona', attendees: 60, revenue: 10000 },
            { name: 'Fiesta de Cumpleaños', location: 'Valencia', attendees: 50, revenue: 8500 }
          ]
        },
        conference: {
          total: 15,
          active: 14,
          completed: 12,
          revenue: 95000, // EUR
          averageAttendees: 180,
          topEvents: [
            { name: 'Tech Conference España', location: 'Madrid', attendees: 280, revenue: 35000 },
            { name: 'Digital Summit ES', location: 'Barcelona', attendees: 220, revenue: 28000 },
            { name: 'Innovation Forum ES', location: 'Valencia', attendees: 180, revenue: 22000 }
          ]
        }
      },
      'US': {
        corporate: {
          total: 35,
          active: 32,
          completed: 28,
          revenue: 120000, // USD
          averageAttendees: 50,
          topEvents: [
            { name: 'Tech Conference US', location: 'San Francisco', attendees: 120, revenue: 35000 },
            { name: 'Business Summit US', location: 'New York', attendees: 95, revenue: 28000 },
            { name: 'Startup Meetup US', location: 'Austin', attendees: 75, revenue: 22000 }
          ]
        },
        wedding: {
          total: 45,
          active: 42,
          completed: 38,
          revenue: 180000, // USD
          averageAttendees: 130,
          topEvents: [
            { name: 'Premium Wedding US', location: 'New York', attendees: 220, revenue: 45000 },
            { name: 'Wedding Celebration US', location: 'Los Angeles', attendees: 200, revenue: 40000 },
            { name: 'Traditional Wedding', location: 'Austin', attendees: 180, revenue: 35000 }
          ]
        },
        birthday: {
          total: 32,
          active: 30,
          completed: 26,
          revenue: 65000, // USD
          averageAttendees: 40,
          topEvents: [
            { name: 'Corporate Birthday US', location: 'San Francisco', attendees: 85, revenue: 18000 },
            { name: 'Birthday Party US', location: 'New York', attendees: 75, revenue: 15000 },
            { name: 'Birthday Celebration', location: 'Austin', attendees: 65, revenue: 12000 }
          ]
        },
        conference: {
          total: 22,
          active: 20,
          completed: 18,
          revenue: 140000, // USD
          averageAttendees: 250,
          topEvents: [
            { name: 'Tech Conference USA', location: 'San Francisco', attendees: 400, revenue: 45000 },
            { name: 'Digital Summit US', location: 'New York', attendees: 320, revenue: 38000 },
            { name: 'Innovation Forum US', location: 'Austin', attendees: 280, revenue: 32000 }
          ]
        }
      }
    };

    const region = validatedData.region || 'BR';
    const events = eventsData[region as keyof typeof eventsData] || eventsData['BR'];
    const eventType = validatedData.eventType || 'all';
    const action = validatedData.action || 'list';
    
    // Get specific event data based on type
    let result;
    if (eventType === 'corporate') {
      result = { corporate: events.corporate };
    } else if (eventType === 'wedding') {
      result = { wedding: events.wedding };
    } else if (eventType === 'birthday') {
      result = { birthday: events.birthday };
    } else if (eventType === 'conference') {
      result = { conference: events.conference };
    } else {
      result = events;
    }

    // Log event request
    const supabase = createServerSupabaseClient();
    await supabase
      .from('b2b_logs')
      .insert({
        user_id: validatedData.userId || validatedData.organizerId || 'test-user',
        b2b_type: 'events',
        region,
        language: validatedData.language || 'pt-BR',
        event_type: eventType,
        action,
        status: 'success',
        details: result
      });

    return res.status(200).json({
      userId: validatedData.userId || validatedData.organizerId || 'test-user',
      region,
      language: validatedData.language || 'pt-BR',
      eventType,
      action,
      eventsData: result,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    console.error('events error:', error);
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error instanceof z.ZodError ? error.errors : 'Unknown error'
    });
  }
}
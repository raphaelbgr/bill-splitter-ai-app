import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { organizerId, eventId } = req.query;

      if (!organizerId) {
        return res.status(400).json({ error: 'Organizer ID is required' });
      }

      if (eventId) {
        // Get specific event with details
        const { data: event, error: eventError } = await supabase
          .from('b2b_events')
          .select(`
            *,
            participants:b2b_event_participants(*),
            expenses:b2b_event_expenses(*)
          `)
          .eq('id', eventId)
          .eq('organizer_id', organizerId)
          .single();

        if (eventError) {
          return res.status(404).json({ error: 'Event not found' });
        }

        return res.status(200).json({ event });
      } else {
        // Get all events for organizer
        const { data: events, error: eventsError } = await supabase
          .from('b2b_events')
          .select('*')
          .eq('organizer_id', organizerId)
          .order('created_at', { ascending: false });

        if (eventsError) {
          return res.status(500).json({ error: 'Failed to fetch events' });
        }

        return res.status(200).json({ events });
      }
    } catch (error) {
      console.error('B2B Events API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      switch (action) {
        case 'create_event':
          const { data: eventCreate, error: eventCreateError } = await supabase
            .from('b2b_events')
            .insert(data)
            .select();

          if (eventCreateError) {
            return res.status(500).json({ error: 'Failed to create event' });
          }

          return res.status(200).json({ event: eventCreate[0] });

        case 'add_participant':
          const { data: participantAdd, error: participantAddError } = await supabase
            .from('b2b_event_participants')
            .insert(data)
            .select();

          if (participantAddError) {
            return res.status(500).json({ error: 'Failed to add participant' });
          }

          return res.status(200).json({ participant: participantAdd[0] });

        case 'add_expense':
          const { data: expenseAdd, error: expenseAddError } = await supabase
            .from('b2b_event_expenses')
            .insert(data)
            .select();

          if (expenseAddError) {
            return res.status(500).json({ error: 'Failed to add expense' });
          }

          return res.status(200).json({ expense: expenseAdd[0] });

        case 'update_event':
          const { data: eventUpdate, error: eventUpdateError } = await supabase
            .from('b2b_events')
            .update(data)
            .eq('id', data.id)
            .select();

          if (eventUpdateError) {
            return res.status(500).json({ error: 'Failed to update event' });
          }

          return res.status(200).json({ event: eventUpdate[0] });

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('B2B Events API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 
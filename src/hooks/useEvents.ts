import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  campus?: string;
  organizer: string;
  createdAt: string;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
}

const generateMockEvents = (): Event[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 'event-1',
      title: 'Tech Career Fair',
      description: 'Meet recruiters from top tech companies. Bring your resume!',
      date: nextWeek.toISOString(),
      location: 'Student Center, Hall A',
      campus: 'Main Campus',
      organizer: 'Career Services',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'event-2',
      title: 'Open Mic Night',
      description: 'Showcase your talent! Music, poetry, comedy - all welcome.',
      date: tomorrow.toISOString(),
      location: 'Campus Café',
      organizer: 'Student Union',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'event-3',
      title: 'Hackathon 2024',
      description: '24-hour coding challenge. Free food, prizes, and swag!',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Engineering Building',
      campus: 'Main Campus',
      organizer: 'CS Club',
      createdAt: new Date().toISOString(),
    },
  ];
};

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });

        if (fetchError) throw fetchError;

        const eventsData: Event[] = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          date: item.event_date,
          location: item.location,
          campus: item.campus || undefined,
          organizer: item.organizer,
          createdAt: item.created_at,
        }));

        setEvents(eventsData);
      } catch (err) {
        error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.date,
          location: eventData.location,
          campus: eventData.campus,
          organizer: eventData.organizer,
          user_id: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.event_date,
        location: data.location,
        campus: data.campus || undefined,
        organizer: data.organizer,
        createdAt: data.created_at,
      };

      setEvents(prev => [newEvent, ...prev]);
      success('Event posted successfully!');
    } catch (err) {
      error('Failed to post event. Please try again.');
      throw err;
    }
  };

  return { events, loading, addEvent };
}

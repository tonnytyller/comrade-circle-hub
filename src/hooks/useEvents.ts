import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

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

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setEvents(generateMockEvents());
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
        createdAt: new Date().toISOString(),
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

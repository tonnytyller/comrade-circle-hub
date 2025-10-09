import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

export interface Confession {
  id: string;
  content: string;
  author?: string;
  isAnonymous: boolean;
  upvotes: number;
  hasUpvoted?: boolean;
  createdAt: string;
}

interface UseConfessionsReturn {
  confessions: Confession[];
  loading: boolean;
  addConfession: (content: string, isAnonymous: boolean) => Promise<void>;
  toggleUpvote: (id: string) => Promise<void>;
  filter: 'trending' | 'newest';
  setFilter: (filter: 'trending' | 'newest') => void;
}

// Mock data generator
const generateMockConfessions = (): Confession[] => {
  const mockContents = [
    "Sometimes I pretend to understand the lecture but I'm completely lost 😅",
    "I have a crush on someone in my study group but I'm too nervous to say anything",
    "I submitted my assignment 5 minutes before the deadline and still got an A",
    "Coffee is the only reason I wake up for 8am classes",
    "I've been using ChatGPT for all my assignments and my grades have never been better",
    "The library is my second home during finals week",
    "I joined this club just to meet new people and it was the best decision ever",
  ];

  return mockContents.map((content, i) => ({
    id: `confession-${i}`,
    content,
    isAnonymous: Math.random() > 0.5,
    author: Math.random() > 0.5 ? `Student${Math.floor(Math.random() * 100)}` : undefined,
    upvotes: Math.floor(Math.random() * 100),
    hasUpvoted: false,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

export function useConfessions(): UseConfessionsReturn {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'newest'>('trending');
  const { success, error } = useNotification();

  useEffect(() => {
    // Simulate fetching confessions
    const fetchConfessions = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = generateMockConfessions();
      setConfessions(mockData);
      setLoading(false);
    };

    fetchConfessions();
  }, []);

  useEffect(() => {
    // Re-sort when filter changes
    setConfessions(prev => {
      const sorted = [...prev];
      if (filter === 'trending') {
        sorted.sort((a, b) => b.upvotes - a.upvotes);
      } else {
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return sorted;
    });
  }, [filter]);

  const addConfession = async (content: string, isAnonymous: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newConfession: Confession = {
        id: `confession-${Date.now()}`,
        content,
        isAnonymous,
        author: isAnonymous ? undefined : `You`,
        upvotes: 0,
        hasUpvoted: false,
        createdAt: new Date().toISOString(),
      };

      setConfessions(prev => [newConfession, ...prev]);
      success('Confession posted successfully!');
    } catch (err) {
      error('Failed to post confession. Please try again.');
      throw err;
    }
  };

  const toggleUpvote = async (id: string) => {
    try {
      // Optimistic update
      setConfessions(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            upvotes: c.hasUpvoted ? c.upvotes - 1 : c.upvotes + 1,
            hasUpvoted: !c.hasUpvoted,
          };
        }
        return c;
      }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      // Rollback on error
      setConfessions(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            upvotes: c.hasUpvoted ? c.upvotes + 1 : c.upvotes - 1,
            hasUpvoted: !c.hasUpvoted,
          };
        }
        return c;
      }));
      error('Failed to update upvote. Please try again.');
    }
  };

  return { confessions, loading, addConfession, toggleUpvote, filter, setFilter };
}

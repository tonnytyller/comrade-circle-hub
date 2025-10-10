import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchConfessions = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('confessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const confessionsData: Confession[] = (data || []).map(item => ({
          id: item.id,
          content: item.content,
          author: item.is_anonymous ? 'Anonymous' : 'User',
          isAnonymous: item.is_anonymous,
          upvotes: item.upvotes,
          hasUpvoted: false,
          createdAt: item.created_at,
        }));

        setConfessions(confessionsData);
      } catch (err) {
        error('Failed to load confessions');
      } finally {
        setLoading(false);
      }
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
      const { data, error: insertError } = await supabase
        .from('confessions')
        .insert({
          content,
          is_anonymous: isAnonymous,
          author_id: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newConfession: Confession = {
        id: data.id,
        content: data.content,
        author: data.is_anonymous ? 'Anonymous' : 'You',
        isAnonymous: data.is_anonymous,
        upvotes: data.upvotes,
        hasUpvoted: false,
        createdAt: data.created_at,
      };

      setConfessions(prev => [newConfession, ...prev]);
      success('Confession posted successfully!');
    } catch (err) {
      error('Failed to post confession. Please try again.');
      throw err;
    }
  };

  const toggleUpvote = async (id: string) => {
    if (!user) {
      error('Please login to upvote');
      return;
    }

    const confession = confessions.find(c => c.id === id);
    if (!confession) return;

    const isUpvoting = !confession.hasUpvoted;

    // Optimistic update
    setConfessions(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          upvotes: isUpvoting ? c.upvotes + 1 : c.upvotes - 1,
          hasUpvoted: isUpvoting,
        };
      }
      return c;
    }));

    try {
      if (isUpvoting) {
        const { error: upvoteError } = await supabase
          .from('confession_upvotes')
          .insert({
            confession_id: id,
            user_id: user.id,
          });

        if (upvoteError) throw upvoteError;

        await supabase
          .from('confessions')
          .update({ upvotes: confession.upvotes + 1 })
          .eq('id', id);
      } else {
        const { error: removeError } = await supabase
          .from('confession_upvotes')
          .delete()
          .eq('confession_id', id)
          .eq('user_id', user.id);

        if (removeError) throw removeError;

        await supabase
          .from('confessions')
          .update({ upvotes: confession.upvotes - 1 })
          .eq('id', id);
      }
    } catch (err) {
      // Rollback on error
      setConfessions(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            upvotes: isUpvoting ? c.upvotes - 1 : c.upvotes + 1,
            hasUpvoted: !isUpvoting,
          };
        }
        return c;
      }));
      error('Failed to update upvote. Please try again.');
    }
  };

  return { confessions, loading, addConfession, toggleUpvote, filter, setFilter };
}

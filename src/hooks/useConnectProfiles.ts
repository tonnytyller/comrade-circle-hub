import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ConnectProfile {
  id: string;
  nickname: string;
  tags: string[];
  bio?: string;
  isLiked?: boolean;
  isMatched?: boolean;
}

interface UseConnectProfilesReturn {
  profiles: ConnectProfile[];
  loading: boolean;
  likeProfile: (id: string) => Promise<void>;
  currentProfileIndex: number;
  nextProfile: () => void;
}

const generateMockProfiles = (): ConnectProfile[] => {
  return [
    {
      id: 'profile-1',
      nickname: 'CoffeeLover',
      tags: ['coffee', 'books', 'photography'],
      bio: 'Third year CS major. Love late night coding sessions with good coffee ☕',
      isLiked: false,
      isMatched: false,
    },
    {
      id: 'profile-2',
      nickname: 'MusicGeek',
      tags: ['indie', 'concerts', 'guitar'],
      bio: 'Music production student. Always down for concerts and jam sessions 🎸',
      isLiked: false,
      isMatched: false,
    },
    {
      id: 'profile-3',
      nickname: 'FitnessFirst',
      tags: ['gym', 'running', 'nutrition'],
      bio: 'Kinesiology major. Gym buddy needed for early morning workouts 💪',
      isLiked: false,
      isMatched: false,
    },
    {
      id: 'profile-4',
      nickname: 'ArtisticSoul',
      tags: ['painting', 'museums', 'design'],
      bio: 'Fine arts student. Looking for creative friends and gallery buddies 🎨',
      isLiked: false,
      isMatched: false,
    },
    {
      id: 'profile-5',
      nickname: 'Bookworm',
      tags: ['reading', 'writing', 'literature'],
      bio: 'English major. Always looking for book recommendations and coffee chats 📚',
      isLiked: false,
      isMatched: false,
    },
  ];
};

export function useConnectProfiles(): UseConnectProfilesReturn {
  const [profiles, setProfiles] = useState<ConnectProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const { success, info } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user?.id || '');

        if (error) throw error;

        const profilesData: ConnectProfile[] = (data || []).map(item => ({
          id: item.id,
          nickname: item.nickname || 'Anonymous',
          tags: item.tags || [],
          bio: item.bio || '',
          isLiked: false,
          isMatched: false,
        }));

        setProfiles(profilesData);
      } catch (err) {
        console.error('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const likeProfile = async (id: string) => {
    if (!user) return;

    // Optimistic update
    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, isLiked: true } : p))
    );

    try {
      const { error: likeError } = await supabase
        .from('profile_likes')
        .insert({
          liker_id: user.id,
          liked_id: id,
        });

      if (likeError) throw likeError;

      // Check for mutual like
      const { data: mutualLike } = await supabase
        .from('profile_likes')
        .select('*')
        .eq('liker_id', id)
        .eq('liked_id', user.id)
        .maybeSingle();

      if (mutualLike) {
        setProfiles(prev =>
          prev.map(p => (p.id === id ? { ...p, isMatched: true } : p))
        );
        success('🎉 It\'s a match! You can now connect with this comrade!');
      } else {
        info('Like sent! If they like you back, you\'ll get a match notification.');
      }
    } catch (err) {
      // Rollback
      setProfiles(prev =>
        prev.map(p => (p.id === id ? { ...p, isLiked: false } : p))
      );
    }
  };

  const nextProfile = () => {
    setCurrentProfileIndex(prev => 
      prev < profiles.length - 1 ? prev + 1 : prev
    );
  };

  return { 
    profiles, 
    loading, 
    likeProfile, 
    currentProfileIndex, 
    nextProfile 
  };
}

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profile?: {
    nickname: string;
  };
}

export function useRealtimeFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates for posts
    const channel = supabase
      .channel('feed-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(postsData?.map(post => post.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', userIds);

      // Combine posts with profiles
      const postsWithProfiles = postsData?.map(post => ({
        ...post,
        user_profile: profilesData?.find(p => p.id === post.user_id)
      })) || [];

      setPosts(postsWithProfiles as FeedPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id });
  };

  const unlikePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('post_likes')
      .delete()
      .match({ post_id: postId, user_id: user.id });
  };

  const addComment = async (postId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content
      });
  };

  return { posts, loading, likePost, unlikePost, addComment, refetch: fetchPosts };
}

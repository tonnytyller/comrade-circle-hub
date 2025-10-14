import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  userNickname?: string;
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          image_url,
          created_at,
          expires_at,
          profiles:user_id (nickname)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedStories: Story[] = (data || []).map((story: any) => ({
        id: story.id,
        userId: story.user_id,
        imageUrl: story.image_url,
        createdAt: story.created_at,
        expiresAt: story.expires_at,
        userNickname: story.profiles?.nickname || 'Anonymous',
      }));

      setStories(formattedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStory = async (imageFile: File): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName);

      // Create story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
        });

      if (insertError) throw insertError;

      // Refresh stories
      await fetchStories();
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  };

  const deleteStory = async (storyId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      // Refresh stories
      await fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    addStory,
    deleteStory,
    refetch: fetchStories,
  };
}

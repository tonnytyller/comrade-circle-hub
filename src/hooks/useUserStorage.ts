import { supabase } from '@/integrations/supabase/client';

export function useUserStorage() {
  const uploadMedia = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('user-content')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('user-content')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const deleteMedia = async (filePath: string) => {
    const { error } = await supabase.storage
      .from('user-content')
      .remove([filePath]);

    if (error) throw error;
  };

  return { uploadMedia, deleteMedia };
}

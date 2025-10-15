-- Add foreign key relationship between posts and profiles
ALTER TABLE public.posts 
  ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;
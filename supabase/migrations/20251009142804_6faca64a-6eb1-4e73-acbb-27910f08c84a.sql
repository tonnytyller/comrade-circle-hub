-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text,
  tags text[],
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create confessions table
CREATE TABLE public.confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_anonymous boolean NOT NULL DEFAULT true,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create confession_upvotes table to track who upvoted what
CREATE TABLE public.confession_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(confession_id, user_id)
);

-- Create hustles table
CREATE TABLE public.hustles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('job', 'internship', 'project', 'tutoring', 'other')),
  posted_by text NOT NULL,
  contact_email text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  campus text,
  organizer text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create profile_likes table for Connect feature
CREATE TABLE public.profile_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(liker_id, liked_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confession_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hustles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Confessions policies
CREATE POLICY "Confessions are viewable by everyone"
  ON public.confessions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create confessions"
  ON public.confessions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own confessions"
  ON public.confessions FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own confessions"
  ON public.confessions FOR DELETE
  USING (auth.uid() = author_id);

-- Confession upvotes policies
CREATE POLICY "Upvotes are viewable by everyone"
  ON public.confession_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote"
  ON public.confession_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own upvotes"
  ON public.confession_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- Hustles policies
CREATE POLICY "Hustles are viewable by everyone"
  ON public.hustles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create hustles"
  ON public.hustles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hustles"
  ON public.hustles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hustles"
  ON public.hustles FOR DELETE
  USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid() = user_id);

-- Profile likes policies
CREATE POLICY "Likes are viewable by involved users"
  ON public.profile_likes FOR SELECT
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Users can like profiles"
  ON public.profile_likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can remove their likes"
  ON public.profile_likes FOR DELETE
  USING (auth.uid() = liker_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, tags, bio)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nickname',
    CASE 
      WHEN NEW.raw_user_meta_data->>'tags' IS NOT NULL 
      THEN string_to_array(NEW.raw_user_meta_data->>'tags', ',')
      ELSE NULL
    END,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_confessions_created_at ON public.confessions(created_at DESC);
CREATE INDEX idx_confessions_upvotes ON public.confessions(upvotes DESC);
CREATE INDEX idx_hustles_created_at ON public.hustles(created_at DESC);
CREATE INDEX idx_hustles_category ON public.hustles(category);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_confession_upvotes_confession ON public.confession_upvotes(confession_id);
CREATE INDEX idx_confession_upvotes_user ON public.confession_upvotes(user_id);
-- Enable Row Level Security on all tables by default
ALTER DATABASE postgres SET "app.jwt_secret" TO '${JWT_SECRET}';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create user_files table for storing file references
CREATE TABLE IF NOT EXISTS public.user_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_files
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Create policies for user_files
CREATE POLICY "Users can view their own files"
  ON public.user_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON public.user_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON public.user_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.user_files FOR DELETE
  USING (auth.uid() = user_id);

-- Create a storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT (name) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-files' AND
    (auth.role() = 'authenticated')
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-files' AND
    (auth.role() = 'authenticated')
  );

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-files' AND
    (auth.role() = 'authenticated')
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-files' AND
    (auth.role() = 'authenticated')
  );

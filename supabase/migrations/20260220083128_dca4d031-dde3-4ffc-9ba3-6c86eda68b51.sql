
-- Create song status enum
CREATE TYPE public.song_status AS ENUM ('queued', 'analyzing', 'synthesizing', 'mastering', 'completed', 'failed');

-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  genre TEXT NOT NULL,
  audio_url TEXT,
  status public.song_status NOT NULL DEFAULT 'queued',
  cover_art_url TEXT,
  bpm INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create processing_logs table
CREATE TABLE public.processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth required for demo)
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Anyone can create songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update songs" ON public.songs FOR UPDATE USING (true);

CREATE POLICY "Anyone can view logs" ON public.processing_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create logs" ON public.processing_logs FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

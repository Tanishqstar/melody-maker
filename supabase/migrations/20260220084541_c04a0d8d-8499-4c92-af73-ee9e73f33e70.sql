-- Create storage bucket for generated audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('songs-audio', 'songs-audio', true);

-- Allow public read access
CREATE POLICY "Public read access for songs audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'songs-audio');

-- Allow service role insert (edge function uses service role)
CREATE POLICY "Service role insert for songs audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'songs-audio');

-- Allow service role update
CREATE POLICY "Service role update for songs audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'songs-audio');
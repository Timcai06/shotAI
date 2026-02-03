INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated updates" ON storage.objects
    FOR UPDATE TO authenticated 
    USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated deletes" ON storage.objects
    FOR DELETE TO authenticated 
    USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow public read" ON storage.objects
    FOR SELECT TO public 
    USING (bucket_id = 'videos');

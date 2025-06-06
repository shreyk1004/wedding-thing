-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'couple-photos',
  'couple-photos',
  true,
  52428800, -- 50MB (for high-quality professional wedding photography)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Disable RLS on storage.objects to allow all operations
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Disable RLS on weddings table as well
ALTER TABLE weddings DISABLE ROW LEVEL SECURITY; 
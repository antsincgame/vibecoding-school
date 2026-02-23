/*
  # Create Images Storage Bucket

  1. New Storage Bucket
    - `images` - Public bucket for all application images
      - Folders: courses, blog, student-works, general
  
  2. Security
    - Public bucket for read access
    - Authenticated users can upload images
    - Service role can manage all files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

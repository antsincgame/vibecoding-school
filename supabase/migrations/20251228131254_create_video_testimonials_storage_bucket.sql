/*
  # Create Video Testimonials Storage Bucket

  1. Storage Setup
    - Create a public bucket for video testimonial files
    - Allow public read access
    - Allow authenticated admins to upload and delete files
  
  2. Security
    - Public can read all files in the bucket
    - Only authenticated admin users can insert files
    - Only authenticated admin users can delete files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'video-testimonials',
  'video-testimonials',
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view video testimonials"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'video-testimonials');

CREATE POLICY "Admin can upload video testimonials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'video-testimonials'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete video testimonials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'video-testimonials'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
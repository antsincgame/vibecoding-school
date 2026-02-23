/*
  # Create Video Testimonials Table

  1. New Tables
    - `video_testimonials`
      - `id` (uuid, primary key)
      - `student_name` (text) - Name of the student
      - `video_url` (text) - URL to the video (either YouTube or Supabase Storage)
      - `thumbnail_url` (text, nullable) - Optional custom thumbnail
      - `order_index` (integer) - Display order
      - `is_active` (boolean) - Whether to show on the site
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on video_testimonials table
    - Public can read active testimonials
    - Admin can manage all testimonials
  
  3. Indexes
    - Index on is_active for faster filtering
    - Index on order_index for sorting
*/

CREATE TABLE IF NOT EXISTS video_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_testimonials_active ON video_testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_video_testimonials_order ON video_testimonials(is_active, order_index);

ALTER TABLE video_testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active video testimonials"
  ON video_testimonials FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admin can insert video testimonials"
  ON video_testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update video testimonials"
  ON video_testimonials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete video testimonials"
  ON video_testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can read all video testimonials"
  ON video_testimonials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert three fake testimonials with placeholder videos
INSERT INTO video_testimonials (student_name, video_url, thumbnail_url, order_index, is_active) VALUES
  ('Александр К.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=400', 0, true),
  ('Мария В.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=400', 1, true),
  ('Дмитрий С.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400', 2, true);
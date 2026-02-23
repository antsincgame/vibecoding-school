/*
  # Fix RLS policies for admin access and public settings
  
  1. Critical Fixes
    - system_settings: Add public read access for home page settings
    - courses: Allow authenticated users to view all courses (including inactive)
    - faqs: Allow authenticated users to view all FAQs (including inactive)
    - blog_posts: Allow authenticated users to view all posts (including unpublished)
  
  2. Changes
    - Add "Anyone can read system settings" policy for public access
    - Add policies for authenticated users to see all records regardless of status
    
  3. Security Notes
    - Public can only READ settings, not modify
    - Authenticated users can see all records for admin purposes
    - Modification policies remain restricted
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' 
    AND policyname = 'Anyone can read system settings'
  ) THEN
    CREATE POLICY "Anyone can read system settings"
      ON system_settings
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' 
    AND policyname = 'Authenticated users can view all courses'
  ) THEN
    CREATE POLICY "Authenticated users can view all courses"
      ON courses
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'faqs' 
    AND policyname = 'Authenticated users can view all FAQs'
  ) THEN
    CREATE POLICY "Authenticated users can view all FAQs"
      ON faqs
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Authenticated users can view all posts'
  ) THEN
    CREATE POLICY "Authenticated users can view all posts"
      ON blog_posts
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_works' 
    AND policyname = 'Authenticated admins can view all works'
  ) THEN
    CREATE POLICY "Authenticated admins can view all works"
      ON student_works
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

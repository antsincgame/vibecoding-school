/*
  # Fix RLS Policies for blog_posts and system_settings

  ## Changes
  1. blog_posts table:
     - Remove overly permissive insert policy that allowed ANY authenticated user to create posts
     - Add admin-only insert policy to restrict blog post creation to admins only
  
  2. system_settings table:
     - Remove public read access to system_settings
     - Add admin-only read policy to protect sensitive configuration data

  ## Security Improvements
  - Only admins can now create, update, and delete blog posts
  - System settings are no longer publicly readable
  - Prevents unauthorized users from accessing API configuration
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' AND policyname = 'Authenticated users can insert posts'
  ) THEN
    DROP POLICY "Authenticated users can insert posts" ON blog_posts;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' AND policyname = 'Only admins can insert blog posts'
  ) THEN
    CREATE POLICY "Only admins can insert blog posts"
      ON blog_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' AND policyname = 'Anyone can read system settings'
  ) THEN
    DROP POLICY "Anyone can read system settings" ON system_settings;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' AND policyname = 'Only admins can read system settings'
  ) THEN
    CREATE POLICY "Only admins can read system settings"
      ON system_settings
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' AND policyname = 'Only admins can update system settings'
  ) THEN
    CREATE POLICY "Only admins can update system settings"
      ON system_settings
      FOR UPDATE
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' AND policyname = 'Only admins can insert system settings'
  ) THEN
    CREATE POLICY "Only admins can insert system settings"
      ON system_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_settings' AND policyname = 'Only admins can delete system settings'
  ) THEN
    CREATE POLICY "Only admins can delete system settings"
      ON system_settings
      FOR DELETE
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
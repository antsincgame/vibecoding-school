/*
  # Add Homework Attachments Support

  ## Overview
  This migration adds support for students to attach screenshots/images and links
  to their homework submissions.

  ## Changes to Tables
  
  ### `homework_submissions`
  - `attachments` (jsonb) - Array of attachment objects with structure:
    - `type`: 'image' | 'link'
    - `url`: URL to the image in storage or external link
    - `name`: Optional name/description for the attachment

  ## Storage
  - Creates `homework-attachments` bucket for storing uploaded screenshots
  - Students can upload their own attachments
  - Admins and teachers can view all attachments

  ## Security
  - Students can upload files to their own folder (student_id prefix)
  - Anyone authenticated can view homework attachments
  - Students can only manage their own uploads
*/

ALTER TABLE homework_submissions
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'homework-attachments',
  'homework-attachments',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Anyone can view homework attachments'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Anyone can view homework attachments"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'homework-attachments');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Students can upload homework attachments'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Students can upload homework attachments"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'homework-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Students can delete own homework attachments'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Students can delete own homework attachments"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'homework-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

/*
  # Fix Course Modules and Lessons RLS Policies

  1. Changes
    - Drop the overly broad "FOR ALL" policies for course_modules and course_lessons
    - Create specific policies for INSERT, UPDATE, and DELETE operations
    - Keep the existing SELECT policies unchanged
  
  2. Security
    - Admins can insert, update, and delete course modules and lessons
    - Public users can only read (SELECT policy already exists)
    - Follows best practice of separating policies by operation type
*/

-- Drop the existing broad policies
DROP POLICY IF EXISTS "Admin can manage course modules" ON course_modules;
DROP POLICY IF EXISTS "Admin can manage course lessons" ON course_lessons;

-- Create specific policies for course_modules
CREATE POLICY "Admin can insert course modules"
  ON course_modules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update course modules"
  ON course_modules FOR UPDATE
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

CREATE POLICY "Admin can delete course modules"
  ON course_modules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create specific policies for course_lessons
CREATE POLICY "Admin can insert course lessons"
  ON course_lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update course lessons"
  ON course_lessons FOR UPDATE
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

CREATE POLICY "Admin can delete course lessons"
  ON course_lessons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
/*
  # Fix RLS Performance and Remove Unused Indexes

  ## Overview
  This migration optimizes Row Level Security (RLS) policies and removes unused indexes
  to improve database performance and resolve Supabase security recommendations.

  ## RLS Performance Fixes
  
  ### Problem
  Current policies call `auth.uid()` for each row, causing suboptimal performance at scale.
  
  ### Solution
  Replace `auth.uid()` with `(select auth.uid())` to evaluate the function once per query
  instead of once per row.
  
  ### Affected Tables and Policies
  1. **student_works**
     - "Authenticated admins can view all works"
  
  2. **lessons** (5 policies)
     - "Admin can view all lessons"
     - "Admin can insert lessons"
     - "Admin can update lessons"
     - "Admin can delete lessons"
  
  3. **lesson_files** (4 policies)
     - "Admin can view all lesson files"
     - "Admin can insert lesson files"
     - "Admin can update lesson files"
     - "Admin can delete lesson files"
  
  4. **storage.objects** (3 policies for lesson-files bucket)
     - "Admin can upload lesson files"
     - "Admin can update lesson files" 
     - "Admin can delete lesson files"

  ## Index Cleanup
  
  Remove unused indexes that have not been utilized:
  - `idx_lessons_order` - Not used by queries
  - `idx_lesson_files_lesson_id` - Foreign key provides sufficient performance
  - `idx_trial_registrations_course_id` - Not actively used

  ## Important Notes
  - Multiple permissive policies are intentional and provide correct access control
  - Auth DB connection strategy and leaked password protection require project-level settings changes
*/

-- ============================================================================
-- PART 1: Fix RLS Policies for student_works
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated admins can view all works" ON student_works;

CREATE POLICY "Authenticated admins can view all works"
  ON student_works
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 2: Fix RLS Policies for lessons
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can insert lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can update lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can delete lessons" ON lessons;

CREATE POLICY "Admin can view all lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert lessons"
  ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update lessons"
  ON lessons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete lessons"
  ON lessons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 3: Fix RLS Policies for lesson_files
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view all lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can insert lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can update lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Admin can delete lesson files" ON lesson_files;

CREATE POLICY "Admin can view all lesson files"
  ON lesson_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert lesson files"
  ON lesson_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update lesson files"
  ON lesson_files
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete lesson files"
  ON lesson_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 4: Fix Storage Policies for lesson-files bucket
-- ============================================================================

DROP POLICY IF EXISTS "Admin can upload lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update lesson files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete lesson files" ON storage.objects;

CREATE POLICY "Admin can upload lesson files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update lesson files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lesson-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete lesson files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lesson-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 5: Remove Unused Indexes
-- ============================================================================

-- These indexes have not been used and can be safely removed
DROP INDEX IF EXISTS idx_lessons_order;
DROP INDEX IF EXISTS idx_lesson_files_lesson_id;
DROP INDEX IF EXISTS idx_trial_registrations_course_id;
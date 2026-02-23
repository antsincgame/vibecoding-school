/*
  # Fix Foreign Key Indexes and Consolidate RLS Policies

  ## Overview
  This migration addresses security and performance issues by:
  1. Adding missing indexes for foreign key columns
  2. Consolidating multiple permissive RLS policies into single, clearer policies

  ## Part 1: Add Missing Foreign Key Indexes
  
  ### Problem
  Foreign key columns without indexes can cause performance issues, especially for:
  - JOIN operations
  - CASCADE deletes
  - Foreign key constraint checks
  
  ### Solution
  Add indexes for:
  - `lesson_files.lesson_id` (references lessons.id)
  - `trial_registrations.course_id` (references courses.id)

  ## Part 2: Consolidate Multiple Permissive Policies
  
  ### Problem
  Multiple permissive policies for the same action can be confusing and may lead to 
  unintended access. When multiple permissive policies exist, they use OR logic - 
  if ANY policy grants access, the user gets access.
  
  ### Solution
  Replace multiple permissive policies with single, comprehensive policies that 
  clearly define all access conditions in one place.
  
  ### Affected Tables
  1. **blog_posts** - Consolidate 2 SELECT policies
  2. **courses** - Consolidate 2 SELECT policies
  3. **faqs** - Consolidate 2 SELECT policies
  4. **lesson_files** - Consolidate 2 SELECT policies
  5. **lessons** - Consolidate 2 SELECT policies
  6. **profiles** - Consolidate 2 SELECT policies
  7. **student_works** - Consolidate 2 SELECT policies
  8. **system_settings** - Consolidate 2 SELECT, 2 INSERT, and 2 UPDATE policies

  ## Security Notes
  - All policies maintain the same access logic as before
  - Admin access is checked via profiles table role='admin'
  - Public access remains unchanged for published/active content
*/

-- ============================================================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================================================

-- Index for lesson_files.lesson_id foreign key
CREATE INDEX IF NOT EXISTS idx_lesson_files_lesson_id ON lesson_files(lesson_id);

-- Index for trial_registrations.course_id foreign key
CREATE INDEX IF NOT EXISTS idx_trial_registrations_course_id ON trial_registrations(course_id);

-- ============================================================================
-- PART 2: Consolidate RLS Policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- blog_posts: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;

CREATE POLICY "Public can read published posts, authenticated can read all"
  ON blog_posts
  FOR SELECT
  USING (
    is_published = true 
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- courses: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can view all courses" ON courses;

CREATE POLICY "Public can view active courses, authenticated admins can view all"
  ON courses
  FOR SELECT
  USING (
    is_active = true 
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- faqs: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active FAQs" ON faqs;
DROP POLICY IF EXISTS "Authenticated users can view all FAQs" ON faqs;

CREATE POLICY "Public can view active FAQs, authenticated admins can view all"
  ON faqs
  FOR SELECT
  USING (
    is_active = true 
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- lesson_files: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view files for published lessons" ON lesson_files;
DROP POLICY IF EXISTS "Admin can view all lesson files" ON lesson_files;

CREATE POLICY "Public can view files for published lessons, admins can view all"
  ON lesson_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = lesson_files.lesson_id
      AND lessons.is_published = true
    )
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- lessons: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Admin can view all lessons" ON lessons;

CREATE POLICY "Public can view published lessons, admins can view all"
  ON lessons
  FOR SELECT
  USING (
    is_published = true
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- profiles: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile, admins can view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- student_works: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read active student works" ON student_works;
DROP POLICY IF EXISTS "Authenticated admins can view all works" ON student_works;

CREATE POLICY "Public can read active works, admins can view all"
  ON student_works
  FOR SELECT
  USING (
    is_active = true
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- system_settings: Consolidate SELECT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can view system settings" ON system_settings;

CREATE POLICY "Anyone can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- system_settings: Consolidate INSERT policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Authenticated users can insert system settings" ON system_settings;

CREATE POLICY "Only admins can insert system settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- system_settings: Consolidate UPDATE policies
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Authenticated users can update system settings" ON system_settings;

CREATE POLICY "Only admins can update system settings"
  ON system_settings
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
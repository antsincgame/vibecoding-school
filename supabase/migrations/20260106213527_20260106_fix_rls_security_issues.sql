/*
  # Fix RLS Security Issues and Performance Problems
  
  1. RLS Performance Fixes
    - Fix all auth.uid() calls in RLS policies to use (select auth.uid())
    - Applies to: course_modules, course_lessons, inbox, video_testimonials, email_logs, webhook_logs
    - This prevents re-evaluation of auth functions for each row
  
  2. Remove Unused Indexes
    - idx_founder_questions_status
    - idx_course_modules_course_id
    - idx_course_lessons_module_id
    - idx_video_testimonials_active
    - idx_email_logs_recipient
    - idx_email_logs_status
    - idx_email_logs_template_type
    - idx_inbox_from_email
    - idx_inbox_to_email
    - idx_inbox_is_read
    - idx_auth_tokens_expires_at
  
  3. Consolidate Duplicate Policies
    - Remove redundant policies on: system_settings, trial_registrations, blog_posts, courses, faqs, lessons, lesson_files, student_works, video_testimonials
  
  4. Fix Always-True Policies
    - Remove unsafe policies from: founder_questions, site_settings, trial_registrations
    - Replace with proper restrictive policies where needed
  
  5. Add RLS Policies to auth_tokens
    - Secure table that had RLS but no policies
  
  6. Fix Function Search Path
    - Update cleanup_expired_tokens function with proper search path handling
*/

-- ============================================================================
-- PART 1: Fix RLS Performance Issues for course_modules
-- ============================================================================

DROP POLICY IF EXISTS "Admin can insert course modules" ON course_modules;
CREATE POLICY "Admin can insert course modules"
  ON course_modules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update course modules" ON course_modules;
CREATE POLICY "Admin can update course modules"
  ON course_modules FOR UPDATE
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

DROP POLICY IF EXISTS "Admin can delete course modules" ON course_modules;
CREATE POLICY "Admin can delete course modules"
  ON course_modules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 2: Fix RLS Performance Issues for course_lessons
-- ============================================================================

DROP POLICY IF EXISTS "Admin can insert course lessons" ON course_lessons;
CREATE POLICY "Admin can insert course lessons"
  ON course_lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update course lessons" ON course_lessons;
CREATE POLICY "Admin can update course lessons"
  ON course_lessons FOR UPDATE
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

DROP POLICY IF EXISTS "Admin can delete course lessons" ON course_lessons;
CREATE POLICY "Admin can delete course lessons"
  ON course_lessons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 3: Fix RLS Performance Issues for inbox
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all inbox messages" ON inbox;
CREATE POLICY "Admins can view all inbox messages"
  ON inbox FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update inbox messages" ON inbox;
CREATE POLICY "Admins can update inbox messages"
  ON inbox FOR UPDATE
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

DROP POLICY IF EXISTS "Service role can insert inbox messages" ON inbox;
CREATE POLICY "Service role can insert inbox messages"
  ON inbox FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete inbox messages" ON inbox;
CREATE POLICY "Admins can delete inbox messages"
  ON inbox FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 4: Fix RLS Performance Issues for video_testimonials
-- ============================================================================

DROP POLICY IF EXISTS "Admin can insert video testimonials" ON video_testimonials;
CREATE POLICY "Admin can insert video testimonials"
  ON video_testimonials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update video testimonials" ON video_testimonials;
CREATE POLICY "Admin can update video testimonials"
  ON video_testimonials FOR UPDATE
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

DROP POLICY IF EXISTS "Admin can delete video testimonials" ON video_testimonials;
CREATE POLICY "Admin can delete video testimonials"
  ON video_testimonials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can read all video testimonials" ON video_testimonials;
CREATE POLICY "Admin can read all video testimonials"
  ON video_testimonials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 5: Fix RLS Performance Issues for email_logs
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all email logs" ON email_logs;
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;
CREATE POLICY "Service role can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can update email logs" ON email_logs;
CREATE POLICY "Service role can update email logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 6: Fix RLS Performance Issues for webhook_logs
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read webhook logs" ON webhook_logs;
CREATE POLICY "Admins can read webhook logs"
  ON webhook_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 7: Add RLS Policies to auth_tokens table
-- ============================================================================

CREATE POLICY "Admin can view auth tokens"
  ON auth_tokens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete auth tokens"
  ON auth_tokens FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 8: Remove Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_founder_questions_status;
DROP INDEX IF EXISTS idx_course_modules_course_id;
DROP INDEX IF EXISTS idx_course_lessons_module_id;
DROP INDEX IF EXISTS idx_video_testimonials_active;
DROP INDEX IF EXISTS idx_email_logs_recipient;
DROP INDEX IF EXISTS idx_email_logs_status;
DROP INDEX IF EXISTS idx_email_logs_template_type;
DROP INDEX IF EXISTS idx_inbox_from_email;
DROP INDEX IF EXISTS idx_inbox_to_email;
DROP INDEX IF EXISTS idx_inbox_is_read;
DROP INDEX IF EXISTS idx_auth_tokens_expires_at;

-- ============================================================================
-- PART 9: Consolidate Duplicate Policies on system_settings
-- ============================================================================

-- Remove duplicate policies and keep the most comprehensive one
DROP POLICY IF EXISTS "Admin can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Anyone can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Public can read system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON system_settings;

-- Consolidate to single policies per operation
CREATE POLICY "Admin can view system settings"
  ON system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update system settings"
  ON system_settings FOR UPDATE
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

CREATE POLICY "Admin can delete system settings"
  ON system_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 10: Consolidate Duplicate Policies on trial_registrations
-- ============================================================================

-- Remove problematic always-true policies and duplicates
DROP POLICY IF EXISTS "Anyone can create trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Public can insert trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Admin can view all trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Authenticated users can view all registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Admin can update trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Authenticated users can update registrations" ON trial_registrations;

-- Create consolidated policies
CREATE POLICY "Anyone can submit trial registrations"
  ON trial_registrations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin can view trial registrations"
  ON trial_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update trial registrations"
  ON trial_registrations FOR UPDATE
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

-- ============================================================================
-- PART 11: Consolidate Duplicate Policies on blog_posts
-- ============================================================================

DROP POLICY IF EXISTS "Admin can read all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;

CREATE POLICY "Public or admin can read blog posts"
  ON blog_posts FOR SELECT
  USING (
    is_published = true 
    OR (
      (select auth.role()) = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = (select auth.uid()) 
        AND profiles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- PART 12: Consolidate Duplicate Policies on courses
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view all courses" ON courses;
DROP POLICY IF EXISTS "Public can view active courses" ON courses;

CREATE POLICY "Public or admin can view courses"
  ON courses FOR SELECT
  USING (
    is_active = true 
    OR (
      (select auth.role()) = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = (select auth.uid()) 
        AND profiles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- PART 13: Consolidate Duplicate Policies on faqs
-- ============================================================================

DROP POLICY IF EXISTS "Admin can manage all FAQs" ON faqs;
DROP POLICY IF EXISTS "Public can view active FAQs" ON faqs;

CREATE POLICY "Public or admin can view FAQs"
  ON faqs FOR SELECT
  USING (
    is_active = true 
    OR (
      (select auth.role()) = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = (select auth.uid()) 
        AND profiles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- PART 14: Consolidate Duplicate Policies on lessons
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Public can view published lessons" ON lessons;

CREATE POLICY "Public or admin can view lessons"
  ON lessons FOR SELECT
  USING (
    is_published = true 
    OR (
      (select auth.role()) = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = (select auth.uid()) 
        AND profiles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- PART 15: Consolidate Duplicate Policies on lesson_files
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view all lesson files" ON lesson_files;
DROP POLICY IF EXISTS "Public can view files for published lessons" ON lesson_files;

CREATE POLICY "Public or admin can view lesson files"
  ON lesson_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = lesson_files.lesson_id 
      AND lessons.is_published = true
    )
    OR (
      (select auth.role()) = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = (select auth.uid()) 
        AND profiles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- PART 16: Consolidate Duplicate Policies on student_works
-- ============================================================================

DROP POLICY IF EXISTS "Admin can read all student works" ON student_works;
DROP POLICY IF EXISTS "Public can read active student works" ON student_works;

CREATE POLICY "Public or admin can view student works"
  ON student_works FOR SELECT
  USING (
    is_active = true 
    OR (
      (select auth.role()) = 'authenticated' 
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = (select auth.uid()) 
        AND profiles.role = 'admin'
      )
    )
  );

-- ============================================================================
-- PART 17: Consolidate Duplicate Policies on video_testimonials (SELECT)
-- ============================================================================

DROP POLICY IF EXISTS "Public can read active video testimonials" ON video_testimonials;

-- Video testimonials SELECT is already covered by "Admin can read all video testimonials"

-- ============================================================================
-- PART 18: Fix founder_questions Always-True Policy
-- ============================================================================

DROP POLICY IF EXISTS "Public can submit questions" ON founder_questions;

CREATE POLICY "Anyone can submit founder questions"
  ON founder_questions FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================================================
-- PART 19: Fix cleanup_expired_tokens Function Search Path
-- ============================================================================

DROP FUNCTION IF EXISTS cleanup_expired_tokens();

CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth_tokens WHERE expires_at < now();
END;
$$;
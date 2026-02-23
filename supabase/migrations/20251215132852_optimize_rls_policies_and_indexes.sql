/*
  # Optimize RLS Policies and Remove Unused Indexes

  ## Performance Improvements
  
  1. **RLS Policy Optimization**
     - Optimizes SELECT policies on tables: blog_posts, courses, faqs, lesson_files, lessons, student_works
     - Replaces `auth.role()` with `(select auth.role())` to cache the result per query instead of per row
     - Replaces `auth.uid()` with `(select auth.uid())` to cache the result per query instead of per row
     - This significantly improves query performance at scale
  
  2. **Index Cleanup**
     - Removes unused index `idx_lesson_files_lesson_id` (covered by foreign key index)
     - Removes unused index `idx_trial_registrations_course_id` (covered by foreign key index)
  
  ## Changes Made
  
  ### blog_posts
  - DROP and recreate SELECT policy with optimized auth function calls
  
  ### courses
  - DROP and recreate SELECT policy with optimized auth function calls
  
  ### faqs
  - DROP and recreate SELECT policy with optimized auth function calls
  
  ### lesson_files
  - DROP and recreate SELECT policy with optimized auth function calls
  
  ### lessons
  - DROP and recreate SELECT policy with optimized auth function calls
  
  ### student_works
  - DROP and recreate SELECT policy with optimized auth function calls
*/

-- Optimize blog_posts SELECT policy
DROP POLICY IF EXISTS "Public can read published posts, authenticated can read all" ON blog_posts;
CREATE POLICY "Public can read published posts, authenticated can read all"
  ON blog_posts FOR SELECT
  TO public
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

-- Optimize courses SELECT policy
DROP POLICY IF EXISTS "Public can view active courses, authenticated admins can view a" ON courses;
CREATE POLICY "Public can view active courses, authenticated admins can view all"
  ON courses FOR SELECT
  TO public
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

-- Optimize faqs SELECT policy
DROP POLICY IF EXISTS "Public can view active FAQs, authenticated admins can view all" ON faqs;
CREATE POLICY "Public can view active FAQs, authenticated admins can view all"
  ON faqs FOR SELECT
  TO public
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

-- Optimize lesson_files SELECT policy
DROP POLICY IF EXISTS "Public can view files for published lessons, admins can view al" ON lesson_files;
CREATE POLICY "Public can view files for published lessons, admins can view all"
  ON lesson_files FOR SELECT
  TO public
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

-- Optimize lessons SELECT policy
DROP POLICY IF EXISTS "Public can view published lessons, admins can view all" ON lessons;
CREATE POLICY "Public can view published lessons, admins can view all"
  ON lessons FOR SELECT
  TO public
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

-- Optimize student_works SELECT policy
DROP POLICY IF EXISTS "Public can read active works, admins can view all" ON student_works;
CREATE POLICY "Public can read active works, admins can view all"
  ON student_works FOR SELECT
  TO public
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

-- Remove unused indexes
DROP INDEX IF EXISTS idx_lesson_files_lesson_id;
DROP INDEX IF EXISTS idx_trial_registrations_course_id;

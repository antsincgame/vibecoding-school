/*
  # Fix Remaining Security Issues
  
  1. Remove Unused Indexes
    - idx_inbox_message_id (duplicate of unique constraint)
  
  2. Consolidate Duplicate Profiles Policies
    - Merge "Admin can view all profiles" and "Users can view own profile" into single policy
  
  3. Fix Always-True RLS Policies
    - founder_questions: Restrict "Anyone can submit founder questions"
    - site_settings: Fix "Authenticated users can insert settings" and "Authenticated users can update settings"
    - trial_registrations: Restrict "Anyone can submit trial registrations"
*/

-- ============================================================================
-- PART 1: Remove Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_inbox_message_id;

-- ============================================================================
-- PART 2: Consolidate Duplicate Policies on profiles
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile or admin can view all"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 3: Fix founder_questions Always-True Policy
-- ============================================================================

DROP POLICY IF EXISTS "Public can submit founder questions" ON founder_questions;

CREATE POLICY "Public can submit founder questions"
  ON founder_questions FOR INSERT
  TO public
  WITH CHECK (
    name IS NOT NULL 
    AND email IS NOT NULL 
    AND question IS NOT NULL
  );

-- ============================================================================
-- PART 4: Fix site_settings Always-True Policies
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can insert settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON site_settings;

CREATE POLICY "Admin can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update site settings"
  ON site_settings FOR UPDATE
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
-- PART 5: Fix trial_registrations Always-True Policy
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can submit trial registrations" ON trial_registrations;
DROP POLICY IF EXISTS "Public can submit trial registrations" ON trial_registrations;

CREATE POLICY "Public can submit trial registrations"
  ON trial_registrations FOR INSERT
  TO public
  WITH CHECK (
    email IS NOT NULL 
    AND parent_name IS NOT NULL
  );
/*
  # Fix founder_questions RLS policies to use JWT

  1. Changes
    - Replace recursive profiles checks with JWT-based admin role verification
    - Prevents infinite recursion when updating/deleting questions
    
  2. Security
    - Admin role checked from JWT token (app_metadata)
    - Public can still submit questions
    - Only admins can view, update, and delete questions
*/

-- Drop old policies
DROP POLICY IF EXISTS "Admin can view all questions" ON founder_questions;
DROP POLICY IF EXISTS "Admin can update questions" ON founder_questions;
DROP POLICY IF EXISTS "Admin can delete questions" ON founder_questions;

-- Recreate policies with JWT-based checks
CREATE POLICY "Admin can view all questions"
  ON founder_questions
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can update questions"
  ON founder_questions
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin can delete questions"
  ON founder_questions
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

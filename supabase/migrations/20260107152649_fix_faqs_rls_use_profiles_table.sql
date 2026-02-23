/*
  # Fix FAQs RLS policies to check role via profiles table

  ## Problem
  The current RLS policies check `auth.jwt() -> 'app_metadata' ->> 'role'` but JWT tokens
  are cached at login time. If admin role was added after login, the JWT won't contain it.

  ## Solution
  Check admin role directly in profiles table instead of JWT app_metadata.

  ## Changes
  1. Drop existing admin policies for FAQs
  2. Create new policies that check role via profiles table
*/

DROP POLICY IF EXISTS "Admin can insert FAQs" ON faqs;
DROP POLICY IF EXISTS "Admin can update FAQs" ON faqs;
DROP POLICY IF EXISTS "Admin can delete FAQs" ON faqs;
DROP POLICY IF EXISTS "Public or admin can view FAQs" ON faqs;

CREATE POLICY "Admin can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update FAQs"
  ON faqs FOR UPDATE
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

CREATE POLICY "Admin can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public or admin can view FAQs"
  ON faqs FOR SELECT
  USING (
    is_active = true
    OR (
      auth.role() = 'authenticated'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
  );

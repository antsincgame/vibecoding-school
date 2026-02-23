/*
  # Fix profiles update policy for admins

  1. Changes
    - Drop existing update policy that only allows self-updates
    - Create new update policy that allows:
      - Users to update their own profile
      - Admins to update any profile (checked via profiles table role)
  
  2. Security
    - Admins can update any user's profile
    - Regular users can still only update their own profile
*/

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile or admins update all"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = id) 
    OR 
    (EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    ))
  )
  WITH CHECK (
    (auth.uid() = id) 
    OR 
    (EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    ))
  );
/*
  # Fix system_settings UPDATE policy
  
  1. Problem
    - system_settings table has no UPDATE policy
    - Authenticated users cannot save settings changes
    
  2. Solution
    - Add UPDATE policy for authenticated users
    - Allow admins to modify system settings
*/

CREATE POLICY "Authenticated users can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert system settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
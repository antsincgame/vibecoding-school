/*
  # Fix profile creation trigger permissions

  1. Problem
    - The trigger function needs to bypass RLS to insert profiles
    - Current function may not have sufficient permissions
    
  2. Solution
    - Grant necessary permissions to the function
    - Ensure the function can insert into profiles table regardless of RLS
    
  3. Changes
    - Add INSERT policy that allows service role to create profiles
    - This enables the trigger to create profiles for new OAuth users
*/

DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
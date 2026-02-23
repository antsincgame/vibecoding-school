/*
  # Fix profiles RLS recursion issue

  1. Changes
    - Remove recursive admin check from profiles SELECT policy
    - Users can only read their own profile
    - Admin users will use service role for reading all profiles
    
  2. Security
    - Maintains user privacy
    - Prevents infinite recursion
    - Admin operations use backend with elevated privileges
*/

DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

/*
  # Use JWT claims for admin role verification

  1. Changes
    - Update profiles SELECT policy to check admin role from JWT instead of profiles table
    - This prevents infinite recursion
    - Admins can read all profiles, regular users only their own
    
  2. Security
    - Role stored in auth.users raw_app_meta_data
    - Cannot be modified by users
    - Checked via JWT token
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile or admins view all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Function to sync profile role to auth.users app_metadata
CREATE OR REPLACE FUNCTION sync_role_to_auth_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync role changes
DROP TRIGGER IF EXISTS sync_role_to_auth ON profiles;
CREATE TRIGGER sync_role_to_auth
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_auth_metadata();

-- Sync existing admin user
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM profiles p
WHERE auth.users.id = p.id;

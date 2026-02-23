/*
  # Fix missing admin profile and add auto-creation trigger

  1. Changes
    - Add missing profile for user dzmitry.arlou@gmail.com with admin role
    - Create trigger to auto-create profile when new user registers
    
  2. Security
    - Ensures all auth users have corresponding profiles
*/

-- Add missing profile for the second user with admin role
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin',
  ''
FROM auth.users 
WHERE email = 'dzmitry.arlou@gmail.com'
  AND id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

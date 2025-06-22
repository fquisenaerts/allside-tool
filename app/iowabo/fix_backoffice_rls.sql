-- First, enable RLS on the backoffice_admins table if not already enabled
ALTER TABLE public.backoffice_admins ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow full access to service role" ON public.backoffice_admins;
DROP POLICY IF EXISTS "Allow select access to authenticated users" ON public.backoffice_admins;
DROP POLICY IF EXISTS "Allow insert to service role" ON public.backoffice_admins;
DROP POLICY IF EXISTS "Allow update to service role" ON public.backoffice_admins;

-- Create policies that allow the service role to do everything
CREATE POLICY "Allow full access to service role" 
ON public.backoffice_admins
USING (true)
WITH CHECK (true);

-- Create a function to check if the current user has the service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean AS $$
BEGIN
  -- This will return true when called with service_role
  RETURN current_setting('role', false) = 'service_role';
EXCEPTION
  -- Handle the case when the setting doesn't exist
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the backoffice_admins actions to use the service role
CREATE OR REPLACE FUNCTION update_admin_token(admin_id uuid, new_token text)
RETURNS void AS $$
BEGIN
  UPDATE public.backoffice_admins
  SET token = new_token
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.backoffice_admins TO service_role;
GRANT EXECUTE ON FUNCTION public.update_admin_token TO service_role;
GRANT EXECUTE ON FUNCTION public.is_service_role TO service_role;

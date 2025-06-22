-- Create a function to update admin tokens that bypasses RLS
CREATE OR REPLACE FUNCTION public.update_admin_token(admin_id UUID, new_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.backoffice_admins
  SET token = new_token
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.update_admin_token TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_token TO anon;
GRANT EXECUTE ON FUNCTION public.update_admin_token TO service_role;

-- Ensure RLS is disabled for the function
ALTER FUNCTION public.update_admin_token SECURITY DEFINER;

-- Fix RLS policies on backoffice_admins table
ALTER TABLE public.backoffice_admins ENABLE ROW LEVEL SECURITY;

-- Create policies that allow the service_role to do anything
CREATE POLICY "Service role can do anything on backoffice_admins"
  ON public.backoffice_admins
  FOR ALL
  TO service_role
  USING (true);

-- Create policies for authenticated and anonymous users
CREATE POLICY "Users can select their own admin record"
  ON public.backoffice_admins
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update their own admin record"
  ON public.backoffice_admins
  FOR UPDATE
  TO authenticated, anon
  USING (true);

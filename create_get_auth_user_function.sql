-- Create a function to get auth user data by ID
CREATE OR REPLACE FUNCTION public.get_auth_user_by_id(user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'last_sign_in_at', last_sign_in_at,
      'raw_user_meta_data', raw_user_meta_data,
      'app_metadata', app_metadata,
      'email_confirmed_at', email_confirmed_at,
      'phone_confirmed_at', phone_confirmed_at,
      'confirmed_at', confirmed_at,
      'banned_until', banned_until,
      'reauthentication_token', reauthentication_token,
      'is_sso_user', is_sso_user
    )
  INTO user_data
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_data;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_by_id TO anon;

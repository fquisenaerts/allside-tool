-- Function to get total users count from auth.users
CREATE OR REPLACE FUNCTION get_auth_users_count()
RETURNS TABLE (count bigint) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT COUNT(*)::bigint FROM auth.users;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users_count() TO service_role;

-- Function to get users from auth.users with pagination
CREATE OR REPLACE FUNCTION get_auth_users(
  page_number integer DEFAULT 1,
  items_per_page integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data
  FROM auth.users u
  ORDER BY u.created_at DESC
  LIMIT items_per_page
  OFFSET (page_number - 1) * items_per_page;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users(integer, integer) TO service_role;

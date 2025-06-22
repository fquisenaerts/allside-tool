-- Function to get the total count of users
CREATE OR REPLACE FUNCTION get_total_users_count()
RETURNS TABLE (count bigint) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT COUNT(*)::bigint FROM auth.users;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to the anon role
GRANT EXECUTE ON FUNCTION get_total_users_count() TO anon;
GRANT EXECUTE ON FUNCTION get_total_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_users_count() TO service_role;

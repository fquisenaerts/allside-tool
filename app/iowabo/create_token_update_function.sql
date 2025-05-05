-- Create a function to update admin tokens
CREATE OR REPLACE FUNCTION update_admin_token(admin_id UUID, new_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE backoffice_admins
  SET token = new_token
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION update_admin_token TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_token TO anon;

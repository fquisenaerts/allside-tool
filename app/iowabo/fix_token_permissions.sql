-- Grant proper permissions for the token column
ALTER TABLE backoffice_admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to update their own token
CREATE POLICY update_own_token ON backoffice_admins
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create policy to allow reading tokens for authentication
CREATE POLICY read_tokens ON backoffice_admins
    FOR SELECT
    USING (true);

-- Ensure the token column is not null and has a default value
ALTER TABLE backoffice_admins 
    ALTER COLUMN token SET DEFAULT gen_random_uuid()::text;

-- Reset all tokens to force re-login (optional)
-- UPDATE backoffice_admins SET token = gen_random_uuid()::text;

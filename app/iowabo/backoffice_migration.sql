-- Run this SQL in your Supabase SQL Editor if the automatic table creation fails

-- Create the backoffice_admins table
CREATE TABLE IF NOT EXISTS backoffice_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS backoffice_admins_email_idx ON backoffice_admins (email);

-- Create an index on the token column for faster authentication
CREATE INDEX IF NOT EXISTS backoffice_admins_token_idx ON backoffice_admins (token);

-- Insert a default admin account (change the email and password)
-- INSERT INTO backoffice_admins (email, password, token)
-- VALUES ('admin@example.com', 'securepassword', uuid_generate_v4());

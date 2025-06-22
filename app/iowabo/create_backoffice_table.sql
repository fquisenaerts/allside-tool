-- Run this SQL in your Supabase SQL Editor to create the backoffice_admins table

-- Create the backoffice_admins table
CREATE TABLE IF NOT EXISTS public.backoffice_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  token TEXT,
  registration_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS backoffice_admins_email_idx ON public.backoffice_admins (email);
CREATE INDEX IF NOT EXISTS backoffice_admins_token_idx ON public.backoffice_admins (token);

-- Grant necessary permissions
GRANT ALL ON TABLE public.backoffice_admins TO authenticated;
GRANT ALL ON TABLE public.backoffice_admins TO service_role;
GRANT ALL ON TABLE public.backoffice_admins TO anon;

-- Enable Row Level Security
ALTER TABLE public.backoffice_admins ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for simplicity)
CREATE POLICY "Allow all operations for authenticated users" 
ON public.backoffice_admins 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create a policy that allows reading for anonymous users (for login)
CREATE POLICY "Allow reading for anonymous users" 
ON public.backoffice_admins 
FOR SELECT 
TO anon 
USING (true);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_admin_token;

-- Create or replace the function to update admin tokens
CREATE OR REPLACE FUNCTION public.update_admin_token(admin_id UUID, new_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.backoffice_admins
  SET token = new_token
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset RLS policies
ALTER TABLE public.backoffice_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.backoffice_admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS backoffice_admins_select_policy ON public.backoffice_admins;
DROP POLICY IF EXISTS backoffice_admins_insert_policy ON public.backoffice_admins;
DROP POLICY IF EXISTS backoffice_admins_update_policy ON public.backoffice_admins;

-- Create new policies with broader permissions
CREATE POLICY backoffice_admins_select_policy ON public.backoffice_admins
  FOR SELECT USING (true);

CREATE POLICY backoffice_admins_insert_policy ON public.backoffice_admins
  FOR INSERT WITH CHECK (true);

CREATE POLICY backoffice_admins_update_policy ON public.backoffice_admins
  FOR UPDATE USING (true);

-- Ensure the table has the correct structure
DO $$
BEGIN
  -- Check if the table exists
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'backoffice_admins'
  ) THEN
    -- Table exists, make sure it has all required columns
    -- Add any missing columns
    BEGIN
      ALTER TABLE public.backoffice_admins ADD COLUMN IF NOT EXISTS token TEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Column might already exist, ignore error
    END;
    
    BEGIN
      ALTER TABLE public.backoffice_admins ADD COLUMN IF NOT EXISTS registration_code TEXT;
    EXCEPTION WHEN OTHERS THEN
      -- Column might already exist, ignore error
    END;
    
    BEGIN
      ALTER TABLE public.backoffice_admins ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
    EXCEPTION WHEN OTHERS THEN
      -- Column might already exist, ignore error
    END;
  ELSE
    -- Table doesn't exist, create it
    CREATE TABLE public.backoffice_admins (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      token TEXT,
      registration_code TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Insert a default admin account
    INSERT INTO public.backoffice_admins (email, password, token, registration_code)
    VALUES ('admin@example.com', 'admin123', uuid_generate_v4()::text, 'ADMIN123');
  END IF;
END $$;

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE ON public.backoffice_admins TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE backoffice_admins_id_seq TO anon, authenticated;

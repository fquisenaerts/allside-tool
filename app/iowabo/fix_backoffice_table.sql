-- Run this SQL in your Supabase SQL Editor to fix the backoffice_admins table

-- Add the token column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'backoffice_admins' 
        AND column_name = 'token'
    ) THEN
        ALTER TABLE public.backoffice_admins ADD COLUMN token TEXT;
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'backoffice_admins' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.backoffice_admins ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'backoffice_admins' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.backoffice_admins ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS backoffice_admins_email_idx ON public.backoffice_admins (email);
CREATE INDEX IF NOT EXISTS backoffice_admins_token_idx ON public.backoffice_admins (token);

-- Grant necessary permissions
GRANT ALL ON TABLE public.backoffice_admins TO authenticated;
GRANT ALL ON TABLE public.backoffice_admins TO service_role;
GRANT ALL ON TABLE public.backoffice_admins TO anon;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.backoffice_admins ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'backoffice_admins' 
        AND policyname = 'Allow all operations for authenticated users'
    ) THEN
        CREATE POLICY "Allow all operations for authenticated users" 
        ON public.backoffice_admins 
        FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'backoffice_admins' 
        AND policyname = 'Allow reading for anonymous users'
    ) THEN
        CREATE POLICY "Allow reading for anonymous users" 
        ON public.backoffice_admins 
        FOR SELECT 
        TO anon 
        USING (true);
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

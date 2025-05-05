-- Make sure the users table exists with the minimum required fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO service_role;

-- Disable any existing triggers on the users table
DO $$
DECLARE
  trigger_name TEXT;
BEGIN
  FOR trigger_name IN (
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'users'
  )
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON public.users';
  END LOOP;
END
$$;

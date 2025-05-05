-- 1. Check if auth schema exists and is accessible
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
  ) THEN
    RAISE NOTICE 'Auth schema exists';
  ELSE
    RAISE EXCEPTION 'Auth schema does not exist or is not accessible';
  END IF;
END $$;

-- 2. Check if auth.users table exists and is accessible
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    RAISE NOTICE 'Auth.users table exists';
  ELSE
    RAISE EXCEPTION 'Auth.users table does not exist or is not accessible';
  END IF;
END $$;

-- 3. Check auth.users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check if there are any constraints on auth.users that might be causing issues
SELECT con.conname AS constraint_name,
       con.contype AS constraint_type,
       pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'auth' AND rel.relname = 'users';

-- 5. Check if there are any triggers on auth.users
SELECT tgname AS trigger_name,
       pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- 6. Check if the service role has proper permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY grantee, privilege_type;

-- 7. Check if there are any row-level security policies on auth.users
SELECT polname AS policy_name,
       polcmd AS command,
       polpermissive AS permissive,
       polroles::text AS roles,
       pg_get_expr(polqual, 'auth.users'::regclass) AS expression
FROM pg_policy
WHERE polrelid = 'auth.users'::regclass;

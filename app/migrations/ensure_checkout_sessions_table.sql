-- Check if the checkout_sessions table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'checkout_sessions'
  ) THEN
    -- Create the checkout_sessions table
    CREATE TABLE public.checkout_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      session_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'created',
      plan TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      metadata JSONB
    );

    -- Add indexes
    CREATE INDEX checkout_sessions_user_id_idx ON public.checkout_sessions(user_id);
    CREATE INDEX checkout_sessions_session_id_idx ON public.checkout_sessions(session_id);
    CREATE INDEX checkout_sessions_status_idx ON public.checkout_sessions(status);

    -- Set up RLS
    ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY checkout_sessions_select_policy ON public.checkout_sessions
      FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

    CREATE POLICY checkout_sessions_insert_policy ON public.checkout_sessions
      FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

    CREATE POLICY checkout_sessions_update_policy ON public.checkout_sessions
      FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE ON public.checkout_sessions TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.checkout_sessions TO service_role;
  END IF;
END $$;

-- Create checkout_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'created',
  plan TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB
);

-- Add RLS policies
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own checkout sessions
CREATE POLICY checkout_sessions_select_policy ON public.checkout_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to manage all checkout sessions
CREATE POLICY checkout_sessions_service_policy ON public.checkout_sessions
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.checkout_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.checkout_sessions TO anon;
GRANT USAGE ON SEQUENCE checkout_sessions_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE checkout_sessions_id_seq TO anon;

-- Create a table to track checkout attempts
CREATE TABLE IF NOT EXISTS public.checkout_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Add indexes
CREATE INDEX IF NOT EXISTS checkout_attempts_user_id_idx ON public.checkout_attempts(user_id);
CREATE INDEX IF NOT EXISTS checkout_attempts_status_idx ON public.checkout_attempts(status);

-- Set up RLS
ALTER TABLE public.checkout_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS checkout_attempts_select_policy ON public.checkout_attempts
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS checkout_attempts_insert_policy ON public.checkout_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT ON public.checkout_attempts TO authenticated;
GRANT SELECT, INSERT ON public.checkout_attempts TO service_role;

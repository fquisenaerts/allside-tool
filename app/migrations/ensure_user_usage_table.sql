-- Create user_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  reviews_analyzed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own usage data" ON public.user_usage;
DROP POLICY IF EXISTS "Service role can manage all usage data" ON public.user_usage;

-- Allow users to read their own usage data
CREATE POLICY "Users can read their own usage data"
  ON public.user_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to manage all data
CREATE POLICY "Service role can manage all usage data"
  ON public.user_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON public.user_usage(user_id, month);

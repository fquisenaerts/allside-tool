-- Function to create the user_usage table if it doesn't exist
CREATE OR REPLACE FUNCTION create_user_usage_table()
RETURNS void AS $$
BEGIN
  -- Check if the uuid-ossp extension is available
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Create the user_usage table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    reviews_analyzed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
  );

  -- Add RLS policies if the table was just created
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_usage' AND policyname = 'Users can read their own usage data'
  ) THEN
    -- Enable RLS
    ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

    -- Allow users to read their own usage data
    CREATE POLICY "Users can read their own usage data"
      ON public.user_usage
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Only allow service role to insert/update
    CREATE POLICY "Service role can insert/update usage data"
      ON public.user_usage
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END;
$$ LANGUAGE plpgsql;

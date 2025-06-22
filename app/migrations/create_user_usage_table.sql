-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Function to create the user_usage table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_user_usage_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT (SELECT public.check_table_exists('user_usage')) THEN
    -- Create the table
    CREATE TABLE public.user_usage (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      review_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, month, year)
    );

    -- Set up RLS policies
    ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

    -- Policy for users to see only their own usage
    CREATE POLICY "Users can view their own usage"
      ON public.user_usage
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Policy for users to update their own usage
    CREATE POLICY "Users can update their own usage"
      ON public.user_usage
      FOR UPDATE
      USING (auth.uid() = user_id);

    -- Policy for users to insert their own usage
    CREATE POLICY "Users can insert their own usage"
      ON public.user_usage
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE ON public.user_usage TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON public.user_usage TO service_role;
  END IF;
END;
$$;

-- Check if subscriptions table exists, create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
        CREATE TABLE public.subscriptions (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            stripe_customer_id text,
            stripe_subscription_id text,
            status text,
            plan_id text,
            current_period_start timestamp with time zone,
            current_period_end timestamp with time zone,
            cancel_at timestamp with time zone,
            canceled_at timestamp with time zone,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
END
$$;

-- Add foreign key if it doesn't exist
DO $$
BEGIN
    -- Check if the user_id column exists in subscriptions table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'user_id'
    ) THEN
        -- Check if the foreign key constraint already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema = 'public' 
            AND tc.table_name = 'subscriptions' 
            AND ccu.column_name = 'user_id'
        ) THEN
            -- Add the foreign key constraint
            ALTER TABLE public.subscriptions 
            ADD CONSTRAINT subscriptions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END
$$;

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
    DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
    
    -- Create new policies
    CREATE POLICY "Users can view their own subscriptions" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all subscriptions" 
    ON public.subscriptions FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
END
$$;

-- Grant permissions
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

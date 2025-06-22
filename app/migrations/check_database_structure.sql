-- Check if auth.users table exists (this should exist in Supabase)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'auth' AND tablename = 'users'
    ) THEN
        RAISE EXCEPTION 'auth.users table does not exist. This is a critical Supabase table.';
    END IF;
END
$$;

-- Check if subscriptions table exists, create it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'subscriptions'
    ) THEN
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
        
        -- Enable RLS
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view their own subscriptions" 
        ON public.subscriptions FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Admins can view all subscriptions" 
        ON public.subscriptions FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM auth.users
                WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
            )
        );
        
        -- Grant permissions
        GRANT ALL ON public.subscriptions TO authenticated;
        GRANT ALL ON public.subscriptions TO service_role;
    END IF;
END
$$;

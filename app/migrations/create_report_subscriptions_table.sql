-- Create report_subscriptions table
CREATE TABLE IF NOT EXISTS report_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  establishment_url TEXT NOT NULL,
  establishment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sent_at TIMESTAMP WITH TIME ZONE
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS report_subscriptions_user_id_idx ON report_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS report_subscriptions_frequency_idx ON report_subscriptions(frequency);

-- Add RLS policies
ALTER TABLE report_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own subscriptions
CREATE POLICY report_subscriptions_select_policy ON report_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own subscriptions
CREATE POLICY report_subscriptions_insert_policy ON report_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own subscriptions
CREATE POLICY report_subscriptions_update_policy ON report_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own subscriptions
CREATE POLICY report_subscriptions_delete_policy ON report_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

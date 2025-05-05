-- Create establishments table
CREATE TABLE IF NOT EXISTS establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS establishments_user_id_idx ON establishments(user_id);
CREATE INDEX IF NOT EXISTS establishments_url_idx ON establishments(url);

-- Add RLS policies
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Policy for select (users can only see their own establishments)
CREATE POLICY select_own_establishments ON establishments
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for insert (users can only insert their own establishments)
CREATE POLICY insert_own_establishments ON establishments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for update (users can only update their own establishments)
CREATE POLICY update_own_establishments ON establishments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for delete (users can only delete their own establishments)
CREATE POLICY delete_own_establishments ON establishments
  FOR DELETE USING (auth.uid() = user_id);

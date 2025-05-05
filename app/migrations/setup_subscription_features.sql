-- Add features column to subscriptions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN features JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update existing free trial subscriptions with feature limits
UPDATE public.subscriptions
SET features = jsonb_build_object(
  'establishments', 1,
  'reviews', 200,
  'sentiment_analysis', true,
  'keywords', true,
  'enps', true,
  'response_generation', true,
  'csv_export', true
)
WHERE plan_id = 'free_trial' AND features IS NULL;

-- Update existing standard plan subscriptions with feature limits
UPDATE public.subscriptions
SET features = jsonb_build_object(
  'establishments', 1,
  'reviews', 2000,
  'sentiment_analysis', true,
  'keywords', true,
  'enps', true,
  'response_generation', true,
  'csv_export', true
)
WHERE plan_id = 'standard' AND features IS NULL;

-- Create a function to automatically set features based on plan
CREATE OR REPLACE FUNCTION set_subscription_features()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan_id = 'free_trial' AND (NEW.features IS NULL OR NEW.features = '{}') THEN
    NEW.features = jsonb_build_object(
      'establishments', 1,
      'reviews', 200,
      'sentiment_analysis', true,
      'keywords', true,
      'enps', true,
      'response_generation', true,
      'csv_export', true
    );
  ELSIF NEW.plan_id = 'standard' AND (NEW.features IS NULL OR NEW.features = '{}') THEN
    NEW.features = jsonb_build_object(
      'establishments', 1,
      'reviews', 2000,
      'sentiment_analysis', true,
      'keywords', true,
      'enps', true,
      'response_generation', true,
      'csv_export', true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set features on insert or update
DROP TRIGGER IF EXISTS set_subscription_features_trigger ON public.subscriptions;
CREATE TRIGGER set_subscription_features_trigger
BEFORE INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_subscription_features();

-- Add processing_status column to report_subscriptions table
ALTER TABLE report_subscriptions 
ADD COLUMN IF NOT EXISTS processing_status TEXT;

-- Create an index on the processing_status column for faster queries
CREATE INDEX IF NOT EXISTS idx_report_subscriptions_processing_status 
ON report_subscriptions(processing_status);

-- Create an index on the frequency and processing_status columns for faster queries
CREATE INDEX IF NOT EXISTS idx_report_subscriptions_freq_status 
ON report_subscriptions(frequency, processing_status);

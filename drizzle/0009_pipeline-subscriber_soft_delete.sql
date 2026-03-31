-- Custom SQL migration file, put your code below! --

-- Drop existing trigger/function if they exist
DROP TRIGGER IF EXISTS before_delete_pipeline_subscriber ON pipeline_subscribers;
DROP FUNCTION IF EXISTS soft_unsubscribe_pipeline_subscriber;

-- Create function
CREATE OR REPLACE FUNCTION soft_unsubscribe_pipeline_subscriber()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pipeline_subscribers
  SET unsubscribed_at = NOW()
  WHERE id = OLD.id
    AND unsubscribed_at IS NULL;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER before_delete_pipeline_subscriber
BEFORE DELETE ON pipeline_subscribers
FOR EACH ROW
EXECUTE FUNCTION soft_unsubscribe_pipeline_subscriber();
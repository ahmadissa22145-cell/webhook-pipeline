-- Custom SQL migration file, put your code below! --

DROP TRIGGER IF EXISTS before_delete_subscriber ON subscribers;
DROP FUNCTION IF EXISTS soft_delete_subscriber;


CREATE OR REPLACE FUNCTION soft_delete_subscriber()
RETURNS TRIGGER AS $$
BEGIN

  -- Soft delete the subscriber by setting deleted_at = NOW()
  UPDATE subscribers
  SET deleted_at = NOW()
  WHERE id = OLD.id
  And deleted_at IS NULL; 

  -- Unsubscribe all active pipeline subscriptions linked to this subscriber
  -- by setting unsubscribed_at to NOW()
   UPDATE pipeline_subscribers
  SET 
    unsubscribed_at = NOW()
  WHERE subscriber_id = OLD.id
    AND unsubscribed_at IS NULL;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_delete_subscriber
BEFORE DELETE ON subscribers
FOR EACH ROW
EXECUTE FUNCTION soft_delete_subscriber();





-- Custom SQL migration file, put your code below! --

DROP TRIGGER IF EXISTS before_delete_pipeline ON pipelines;
DROP FUNCTION IF EXISTS soft_delete_pipeline;

CREATE OR REPLACE FUNCTION soft_delete_pipeline()
RETURNS TRIGGER AS $$
BEGIN

  -- Soft delete the pipeline by setting deleted_at = NOW()
  UPDATE pipelines
  SET deleted_at = NOW()
  WHERE id = OLD.id
  And deleted_at IS NULL; 

     -- Soft delete related sources and mark them as inactive
  UPDATE sources
  SET 
    deleted_at = NOW(),
    is_active = false
  WHERE pipeline_id = OLD.id
    AND deleted_at IS NULL;

   -- Unsubscribe all active subscribers linked to this pipeline
   -- by setting unsubscribed_at to NOW()
   UPDATE pipeline_subscribers
  SET 
    unsubscribed_at = NOW()
  WHERE pipeline_id = OLD.id
    AND unsubscribed_at IS NULL;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_delete_pipeline
BEFORE DELETE ON pipelines
FOR EACH ROW
EXECUTE FUNCTION soft_delete_pipeline();





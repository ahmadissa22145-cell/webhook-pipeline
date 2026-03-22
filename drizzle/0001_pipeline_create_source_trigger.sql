-- Custom SQL migration file, put your code below! --

DROP TRIGGER IF EXISTS after_pipeline_insert ON pipelines;
DROP FUNCTION IF EXISTS create_source_after_pipeline;

CREATE OR REPLACE FUNCTION create_source_after_pipeline()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO sources (pipeline_id)
  VALUES (
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_pipeline_insert
AFTER INSERT ON pipelines
FOR EACH ROW
EXECUTE FUNCTION create_source_after_pipeline();
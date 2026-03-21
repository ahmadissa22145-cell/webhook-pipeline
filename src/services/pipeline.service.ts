import { createPipeline } from "../repositories/pipeline.repository.js";
import { NewPipeline } from "../db/schema/index.js";
import { BadRequestError, InternalServerError } from "../errors/index.js";

/**
 * Creates a pipeline
 * Note: A DB trigger automatically creates a corresponding source after insert.
 */
export async function createPipelineService(input: NewPipeline) {
  if (!input.name?.trim())
    throw new BadRequestError("Pipeline name is required");

  if (input.processingActionType === undefined)
    throw new BadRequestError("Processing action type is required");

    try {

      const createdPipeline = await createPipeline(input);

      return createdPipeline
  } catch (error) {
    throw (

      new InternalServerError(`Failed to create pipeline: ${input.name}`),
      { cause: error }
    );
  }
}

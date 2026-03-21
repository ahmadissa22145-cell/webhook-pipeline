import {
  createPipeline,
  updatePipeline,
} from "../repositories/pipeline.repository.js";
import { NewPipeline } from "../db/schema/index.js";
import { BadRequestError, InternalServerError } from "../errors/index.js";
import { ProcessingActionType } from "src/types/processingAction.type.js";

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

    return createdPipeline;
  } catch (error) {
    const err = new InternalServerError(
      `Failed to create pipeline: ${input.name}`,
    );

    err.cause = error;

    throw err;
  }
}

export async function updatePipelineService(
  id: string,
  name?: string,
  processingAction?: ProcessingActionType,
) {
  id = id?.trim();
  name = name?.trim();

  if (!id) throw new BadRequestError("Pipeline id is required");

  if (!name && processingAction === undefined)
    throw new BadRequestError("At least one field is required");

  try {
    return await updatePipeline(id, name, processingAction);
  } catch (error) {
    const err = new InternalServerError(`Failed to update pipeline: ${id}`);

    err.cause = error;

    throw err;
  }
}

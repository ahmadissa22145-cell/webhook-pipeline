import {
  createPipeline,
  getAllPipelines,
  getPipelineById,
  updatePipeline,
} from "../repositories/pipeline.repository.js";
import { NewPipeline } from "../db/schema/index.js";
import { BadRequestError } from "../errors/index.js";
import { ProcessingActionType } from "src/types/processingAction.type.js";

/**
 * Creates a pipeline
 * Note: A DB trigger automatically creates a corresponding source after insert.
 */
export async function createPipelineService(input: NewPipeline) {
  input.name = input.name?.trim();

  if (!input.name) throw new BadRequestError("Pipeline name is required");

  if (input.processingActionType === undefined)
    throw new BadRequestError("Processing action type is required");

  return await createPipeline(input);
}

export async function updatePipelineService(
  id: string,
  name?: string,
  processingAction?: ProcessingActionType,
) {
  if (!id?.trim()) throw new BadRequestError("Pipeline id is required");

  if (!name?.trim() && processingAction === undefined)
    throw new BadRequestError("At least one field is required");

  return await updatePipeline(id.trim(), name?.trim(), processingAction);
}

export async function getAllPipelinesService() {
  return await getAllPipelines();
}

export async function getPipelineByIdService(id: string) {
  if (!id?.trim()) throw new BadRequestError("Pipeline id is required");

  return await getPipelineById(id);
}

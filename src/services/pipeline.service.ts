import {
  createPipeline,
  deletePipeline,
  deletePipelineByName,
  getAllPipelines,
  getPipelineById,
  getPipelineByName,
  isPipelineDeleted,
  isPipelineDeletedByName,
  updatePipeline,
} from "../repositories/pipeline.repository.js";
import { NewPipeline, Pipeline } from "../db/schema/index.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/index.js";
import { ProcessingActionType } from "../types/processingAction.type.js";

// ================== CREATE ==================

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

// ================== UPDATE ==================

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

// ================== READ ==================

export async function getPipelineByIdService(id: string) {
  if (!id?.trim()) throw new BadRequestError("Pipeline id is required");

  return await getPipelineById(id.trim());
}

export async function getPipelineByNameService(name: string) {
  if (!name?.trim()) throw new BadRequestError("Pipeline name is required");

  return await getPipelineByName(name.trim());
}

export async function isPipelineDeletedService(id: string) {
  if (!id?.trim()) throw new BadRequestError("Pipeline id is required");

  return await isPipelineDeleted(id.trim());
}

export async function isPipelineDeletedByNameService(name: string) {
  if (!name?.trim()) throw new BadRequestError("Pipeline name is required");

  return await isPipelineDeletedByName(name.trim());
}

// ================== DELETE ==================

export async function deletePipelineService(
  value: string,
  field: "id" | "name",
  fnGetPipeline: (param: string) => Promise<Pipeline | null>,
  fnDeletePipeline: (paarm: string) => Promise<boolean>,
) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) throw new BadRequestError(`Pipeline ${field} is required`);

  const pipeline = await fnGetPipeline(trimmedValue);

  checkPipelineIsValidToDelete(pipeline);

  return await fnDeletePipeline(trimmedValue);
}

export async function deletePipelineByIdService(id: string) {
  return await deletePipeline(id);
}

export async function deletePipelineByNameService(name: string) {
  return await deletePipelineByName(name);
}

function checkPipelineIsValidToDelete(pipeline: Pipeline | null) {
  if (!pipeline) throw new NotFoundError(`Pipeline not found`);

  if (pipeline.deletedAt)
    throw new ConflictError(`Pipeline is already deleted`);
}

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
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ==================

/**
 * Creates a pipeline
 * Note: A DB trigger automatically creates a corresponding source after insert.
 */
export async function createPipelineService(input: NewPipeline) {
  input.name = trimOrThrow(input.name, "Pipeline name");

  if (input.processingActionType === undefined)
    throw new BadRequestError("Processing action type is required");

  const existing = await getPipelineByName(input.name);

  if (existing) {
    throw new ConflictError(
      `Pipeline with name '${input.name}' already exists`,
    );
  }

  return await createPipeline(input);
}

// ================== UPDATE ==================

export async function updatePipelineService(
  id: string,
  name?: string,
  processingAction?: ProcessingActionType,
) {
  const trimmedId = trimOrThrow(id, "Pipeline id");

  if (!name?.trim() && processingAction === undefined)
    throw new BadRequestError("At least one field is required");

  if (name) {
    const existing = await getPipelineByName(name);

    if (existing?.id !== id) {
      throw new ConflictError(`Pipeline with name '${name}' already exists`);
    }
  }

  return await updatePipeline(trimmedId, name?.trim(), processingAction);
}

// ================== READ ==================

export async function getAllPipelinesService() {
  return await getAllPipelines();
}

export async function getPipelineByIdService(id: string) {
  return await getPipelineById(id);
}

export async function getPipelineByNameService(name: string) {
  return await getPipelineByName(trimOrThrow(name, "Pipeline name"));
}

export async function isPipelineDeletedService(id: string) {
  return await isPipelineDeleted(trimOrThrow(id, "Pipeline id"));
}

export async function isPipelineDeletedByNameService(name: string) {
  return await isPipelineDeletedByName(trimOrThrow(name, "Pipeline name"));
}

// ================== DELETE ==================

export async function deletePipelineService(
  value: string,
  field: "id" | "name",
  fnGetPipeline: (param: string) => Promise<Pipeline | null>,
  fnDeletePipeline: (paarm: string) => Promise<boolean>,
) {
  const trimmedValue = trimOrThrow(value, field);

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

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
  InternalServerError,
  NotFoundError,
} from "../errors/index.js";
import { ProcessingActionType } from "../types/processingAction.type.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ==================

/**
 * Creates a pipeline
 *
 * Why:
 * - Ensure required processing action type is provided
 * - Prevent duplicate pipelines by name
 * - Maintain data integrity before insertion
 */
export async function createPipelineService(input: NewPipeline) {
  if (input.processingActionType === undefined) {
    throw new BadRequestError("Processing action type is required");
  }

  const trimmedName = trimOrThrow(input.name, "Pipeline name");

  // Prevent duplicate names
  const existing = await getPipelineByName(trimmedName);
  if (existing) {
    throw new ConflictError(
      `Pipeline with name '${trimmedName}' already exists`,
    );
  }

  const pipeline = await createPipeline({
    ...input,
  });

  // Defensive check
  if (!pipeline) {
    throw new InternalServerError("Failed to create pipeline");
  }

  return pipeline;
}

// ================== UPDATE ==================

/**
 * Updates pipeline fields.
 *
 * Why:
 * - Require at least one field to update
 * - Prevent duplicate pipeline names
 * - Maintain valid input before updating
 */
export async function updatePipelineService(
  id: string,
  name?: string,
  processingAction?: ProcessingActionType,
) {
  // Normalize and validate id
  const trimmedId = trimOrThrow(id, "Pipeline id");

  // Ensure at least one field
  if (!name && processingAction === undefined) {
    throw new BadRequestError("At least one field is required");
  }

  // Handle name update
  if (name) {
    const trimmedName = trimOrThrow(
      name,
      "Pipeline name",
      "Pipeline name cannot be empty",
    );

    // Prevent duplicate name
    const existing = await getPipelineByNameService(trimmedName);

    if (existing && existing.id !== trimmedId) {
      throw new ConflictError(
        `Pipeline with name '${trimmedName}' already exists`,
      );
    }

    name = trimmedName;
  }

  // Update pipeline
  const updated = await updatePipeline(trimmedId, name, processingAction);

  // Defensive check
  if (!updated) {
    throw new InternalServerError("Failed to update pipeline");
  }

  return true;
}

// ================== READ ==================

/**
 * Retrieves all pipelines.
 */
export async function getAllPipelinesService() {
  return await getAllPipelines();
}

/**
 * Retrieves a pipeline by ID.
 *
 * Why:
 * - Ensure valid input before querying
 */
export async function getPipelineByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Pipeline id");

  const pipeline = await getPipelineById(trimmedId);

  // Defensive check
  if (!pipeline) {
    throw new NotFoundError("Pipeline not found");
  }

  return pipeline;
}

/**
 * Retrieves a pipeline by name.
 *
 * Why:
 * - Ensure valid input before querying
 */
export async function getPipelineByNameService(name: string) {
  const trimmedName = trimOrThrow(name, "Pipeline name");

  const pipeline = await getPipelineByName(trimmedName);

  // Defensive check
  if (!pipeline) {
    throw new NotFoundError("Pipeline not found");
  }

  return pipeline;
}

/**
 * Checks if a pipeline is deleted.
 */
export async function isPipelineDeletedService(id: string) {
  const trimmedId = trimOrThrow(id, "Pipeline id");

  return await isPipelineDeleted(trimmedId);
}

/**
 * Checks if a pipeline is deleted by name.
 */
export async function isPipelineDeletedByNameService(name: string) {
  const trimmedName = trimOrThrow(name, "Pipeline name");

  return isPipelineDeletedByName(trimmedName);
}

// ================== DELETE ==================

/**
 * Deletes a pipeline.
 *
 * Why:
 * - Reuse the same deletion logic for different identifiers (id / name)
 * - Avoid duplicating validation and business rules
 * - Ensure pipeline exists and is not already deleted
 *
 * Design:
 * - Uses injected functions (strategy pattern) to support multiple deletion methods
 */
export async function deletePipelineService(
  value: string,
  fnGetPipeline: (param: string) => Promise<Pipeline | null>,
  fnDeletePipeline: (param: string) => Promise<boolean>,
) {
  const trimmedValue = trimOrThrow(value, "Pipeline identifier");

  // Get pipeline
  const pipeline = await fnGetPipeline(trimmedValue);

  // Validate deletion rules
  checkPipelineIsValidToDelete(pipeline);

  // Delete pipeline
  const deleted = await fnDeletePipeline(trimmedValue);

  // Defensive check
  if (!deleted) {
    throw new InternalServerError("Failed to delete pipeline");
  }

  return true;
}

/**
 * Deletes a pipeline by ID.
 */
export async function deletePipelineByIdService(id: string) {
  return deletePipelineService(id, getPipelineById, deletePipeline);
}

/**
 * Deletes a pipeline by name.
 */
export async function deletePipelineByNameService(name: string) {
  return deletePipelineService(name, getPipelineByName, deletePipelineByName);
}

/**
 * Validates if a pipeline can be deleted.
 *
 * Why:
 * - Ensure pipeline exists
 * - Prevent deleting already deleted pipelines
 */
function checkPipelineIsValidToDelete(pipeline: Pipeline | null) {
  if (!pipeline) {
    throw new NotFoundError("Pipeline not found");
  }

  if (pipeline.deletedAt) {
    throw new ConflictError("Pipeline is already deleted");
  }
}

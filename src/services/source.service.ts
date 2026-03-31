import {
  createSource,
  deleteSource,
  getSourceById,
  getSourceByToken,
  listSources,
  updateSourceStatus,
} from "../repositories/source.repository.js";

import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  InternalServerError,
} from "../errors/index.js";

import { getPipelineByIdService } from "./pipeline.service.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ===================

/**
 * Creates a source for a pipeline
 *
 * Why:
 * - Ensure pipeline exists
 * - Prevent multiple active sources for the same pipeline
 * - Maintain one-to-one relationship between pipeline and source
 *
 * Note:
 * - This function allows creating a new source if the previous one was soft-deleted
 * - This ensures the pipeline can always be re-linked to a new active source
 */
export async function createSourceService(pipelineId: string) {
  const trimmedPipelineId = trimOrThrow(pipelineId, "Pipeline id");

  // Ensure pipeline exists
  const pipeline = await getPipelineByIdService(trimmedPipelineId);

  // Prevent duplicate active source
  if (pipeline.sourceId) {
    throw new ConflictError(
      `Pipeline with id '${trimmedPipelineId}' already has an active source`,
    );
  }

  // Create source
  const source = await createSource(trimmedPipelineId);

  // Defensive check
  if (!source) {
    throw new InternalServerError("Failed to create source");
  }

  return source;
}

// ================== UPDATE ===================

/**
 * Updates source active status
 *
 * Why:
 * - Ensure valid input
 * - Prevent redundant updates
 */
export async function updateSourceStatusService(id: string, isActive: boolean) {
  const trimmedId = trimOrThrow(id, "Source id");

  if (typeof isActive !== "boolean") {
    throw new BadRequestError("isActive must be true or false");
  }

  // Ensure source exists
  const source = await getSourceByIdService(trimmedId);

  // Prevent redundant update
  if (source.isActive === isActive) {
    throw new ConflictError(
      `Source is already ${isActive ? "active" : "inactive"}`,
    );
  }

  const updated = await updateSourceStatus(trimmedId, isActive);

  // Defensive check
  if (!updated) {
    throw new InternalServerError("Failed to update source");
  }

  return true;
}

// ================== READ ===================

/**
 * Retrieves a source by ID
 *
 * Why:
 * - Ensure valid input
 * - Provide clear error if not found
 */
export async function getSourceByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Source id");

  const source = await getSourceById(trimmedId);

  if (!source) {
    throw new NotFoundError(`Source with id '${trimmedId}' not found`);
  }

  return source;
}

// ===========================================

/**
 * Retrieves a source by token
 *
 * Why:
 * - Ensure valid input
 * - Support token-based lookup
 */
export async function getSourceByTokenService(token: string) {
  const trimmedToken = trimOrThrow(token, "Source token");

  const source = await getSourceByToken(trimmedToken);

  if (!source) {
    throw new NotFoundError(`Source with token '${trimmedToken}' not found`);
  }

  return source;
}

// ===========================================

/**
 * Lists all sources
 */
export async function listSourcesService() {
  return listSources();
}

// ================== DELETE ===================

/**
 * Deletes a source
 *
 * Why:
 * - Prevent deleting active sources
 * - Ensure source exists before deletion
 *
 * Note:
 * - Deletion is handled as a soft delete
 * - A database BEFORE DELETE trigger is responsible for:
 *   - Marking the source as deleted (e.g., setting deletedAt)
 *   - Cleaning up relations with pipelines
 * - This protects data from accidental loss and preserves history
 */
export async function deleteSourceService(id: string) {
  const trimmedId = trimOrThrow(id, "Source id");

  // Ensure source exists
  const source = await getSourceByIdService(trimmedId);

  // Prevent deleting active source
  if (source.isActive) {
    throw new ConflictError("Cannot delete active source");
  }

  const deleted = await deleteSource(trimmedId);

  // Defensive check
  if (!deleted) {
    throw new InternalServerError("Failed to delete source");
  }

  return true;
}

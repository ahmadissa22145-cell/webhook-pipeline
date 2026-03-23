import {
  createSource,
  getSourceById,
  getSourceByToken,
  listSources,
  updateSourceStatus,
} from "../repositories/source.repository.js";

import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../errors/index.js";
import { getPipelineByIdService } from "./pipeline.service.js";

// ================== CREATE ===================
export async function createSourceService(pipelineId: string) {
  if (!pipelineId) {
    throw new BadRequestError("Pipeline id is required");
  }

  const pipeline = await getPipelineByIdService(pipelineId);

  if (!pipeline) {
    throw new NotFoundError(`Pipeline with id '${pipelineId}' not found`);
  }

  if (pipeline.sourceId) {
    throw new ConflictError(
      `Pipeline with id '${pipelineId}' already has an active source`,
    );
  }

  return await createSource(pipelineId);
}

// ================== UPDATE ===================

export async function updateSourceStatusService(id: string, isActive: boolean) {
  if (!id) {
    throw new BadRequestError("Source id is required");
  }

  if (typeof isActive !== "boolean") {
    throw new BadRequestError("isActive must be true or false");
  }

  const source = await getSourceById(id);

  if (!source) {
    throw new NotFoundError(`Source with id '${id}' not found`);
  }

  const updated = await updateSourceStatus(id, isActive);

  if (!updated) {
    throw new NotFoundError(`Source with id '${id}' not found`);
  }

  return updated;
}

// ================== READ ===================

export async function getSourceByIdService(id: string) {
  if (!id) {
    throw new BadRequestError("Source id is required");
  }

  const source = await getSourceById(id);

  if (!source) throw new NotFoundError(`Source with id '${id}' not found`);

  return source;
}

// ===========================================

export async function getSourceByTokenService(token: string) {
  if (!token) throw new BadRequestError("Source token is required");

  const source = await getSourceByToken(token);

  if (!source) {
    throw new NotFoundError(`Source with token '${token}' not found`);
  }

  return source;
}

// ===========================================

export async function listSourcesService() {
  return await listSources();
}

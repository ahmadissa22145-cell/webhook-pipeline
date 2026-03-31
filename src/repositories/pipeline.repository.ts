import { ProcessingActionType } from "src/types/processingAction.type";
import { db } from "../db/index.js";
import { Pipeline, pipelines, sources } from "../db/schema/index.js";
import { and, eq, isNotNull, isNull } from "drizzle-orm";

type UpdatePipelineInput = {
  name?: string;
  processingActionType?: ProcessingActionType;
};

// ================== CREATE ==================

export async function createPipeline(
  name: string,
  processingAction: ProcessingActionType,
): Promise<Pipeline> {
  const [pipeline] = await db
    .insert(pipelines)
    .values({
      name: name,
      processingActionType: processingAction,
    })
    .returning();

  return pipeline;
}

// ================== UPDATE ==================

export async function updatePipeline(
  id: string,
  name?: string,
  processingAction?: ProcessingActionType,
) {
  const updateData: UpdatePipelineInput = {};

  if (name) {
    updateData.name = name;
  }

  if (processingAction !== undefined) {
    updateData.processingActionType = processingAction;
  }

  const [updatedPipelines] = await db
    .update(pipelines)
    .set(updateData)
    .where(eq(pipelines.id, id))
    .returning();

  return updatedPipelines ?? null;
}

// ================== READ ===================

export async function getAllPipelines(limit: number) {
  const storedPipelines = await db
    .select({
      id: pipelines.id,
      name: pipelines.name,
      processingActionType: pipelines.processingActionType,
      createdAt: pipelines.createdAt,
      updatedAt: pipelines.updatedAt,
      deletedAt: pipelines.deletedAt,

      sourceId: sources.id,
      sourceToken: sources.token,
      sourceIsActive: sources.isActive,
    })
    .from(pipelines)
    .leftJoin(
      sources,
      and(eq(pipelines.id, sources.pipelineId), isNull(sources.deletedAt)),
    )
    .where(isNull(pipelines.deletedAt))
    .limit(limit);
  return storedPipelines;
}

export async function getPipelineById(id: string) {
  const [storedPipelines] = await db
    .select({
      id: pipelines.id,
      name: pipelines.name,
      processingActionType: pipelines.processingActionType,
      createdAt: pipelines.createdAt,
      updatedAt: pipelines.updatedAt,
      deletedAt: pipelines.deletedAt,

      sourceId: sources.id,
      sourceToken: sources.token,
      sourceIsActive: sources.isActive,
    })
    .from(pipelines)
    .leftJoin(
      sources,
      and(eq(pipelines.id, sources.pipelineId), isNull(sources.deletedAt)),
    )
    .where(and(eq(pipelines.id, id), isNull(pipelines.deletedAt)));

  return storedPipelines ?? null;
}

export async function getPipelineByName(name: string) {
  const [storedPipelines] = await db
    .select({
      id: pipelines.id,
      name: pipelines.name,
      processingActionType: pipelines.processingActionType,
      createdAt: pipelines.createdAt,
      updatedAt: pipelines.updatedAt,
      deletedAt: pipelines.deletedAt,

      sourceId: sources.id,
      sourceToken: sources.token,
      sourceIsActive: sources.isActive,
    })
    .from(pipelines)
    .leftJoin(
      sources,
      and(eq(pipelines.id, sources.pipelineId), isNull(sources.deletedAt)),
    )
    .where(and(eq(pipelines.name, name), isNull(pipelines.deletedAt)));

  return storedPipelines ?? null;
}

export async function isPipelineDeleted(id: string) {
  const existing = await db
    .select({ id: pipelines.id })
    .from(pipelines)
    .where(and(eq(pipelines.id, id), isNotNull(pipelines.deletedAt)));

  return existing.length > 0;
}

export async function isPipelineDeletedByName(name: string) {
  const existing = await db
    .select({ id: pipelines.id })
    .from(pipelines)
    .where(and(eq(pipelines.name, name), isNotNull(pipelines.deletedAt)));

  return existing.length > 0;
}

// ================== DELETE ==================

export async function deletePipeline(id: string) {
  await db
    .delete(pipelines)
    .where(and(eq(pipelines.id, id), isNull(pipelines.deletedAt)));

  return true;
}

export async function deletePipelineByName(name: string) {
  await db
    .delete(pipelines)
    .where(and(eq(pipelines.name, name), isNull(pipelines.deletedAt)));

  return true;
}

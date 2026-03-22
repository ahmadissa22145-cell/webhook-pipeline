import { ProcessingActionType } from "src/types/processingAction.type";
import { db } from "../db/index.js";
import { NewPipeline, Pipeline, pipelines } from "../db/schema/index.js";
import { and, eq, isNotNull, isNull } from "drizzle-orm";

type UpdatePipelineInput = {
  name?: string;
  processingActionType?: ProcessingActionType;
};

// ================== CREATE ==================

export async function createPipeline(input: NewPipeline): Promise<Pipeline> {
  const [pipeline] = await db
    .insert(pipelines)
    .values({
      name: input.name,
      processingActionType: input.processingActionType,
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

  if (name !== undefined) {
    updateData.name = name;
  }

  if (processingAction) {
    updateData.processingActionType = processingAction;
  }

  const [updatedPipelines] = await db
    .update(pipelines)
    .set(updateData)
    .where(eq(pipelines.id, id))
    .returning();

  return updatedPipelines ?? null;
}

// ================== READ ==================

export async function getAllPipelines() {
  const storedPipelines = await db.select().from(pipelines);

  return storedPipelines;
}

export async function getPipelineById(id: string) {
  const [storedPipelines] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id));

  return storedPipelines ?? null;
}

export async function getPipelineByName(name: string) {
  const [storedPipelines] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.name, name));

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

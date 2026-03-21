import { ProcessingActionType } from "src/types/processingAction.type.js";
import { db } from "../db/index.js";
import { NewPipeline, Pipeline, pipelines } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

type UpdatePipelineInput = {
  name?: string;
  processingActionType?: ProcessingActionType;
};

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

import { db } from "../db/index.js";
import { NewPipeline, Pipeline, pipelines } from "../db/schema/index.js";

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

import { db } from "../db/index.js";
import { pipelineSubscribers } from "../db/schema/index.js";

// ================== CREATE (SUBSCRIBE) ===================

export async function createSubscription(
  pipelineId: string,
  subscriberId: string,
) {
  const [subscription] = await db
    .insert(pipelineSubscribers)
    .values({
      pipelineId,
      subscriberId,
    })
    .returning();

  return subscription;
}

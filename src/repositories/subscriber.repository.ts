import { db } from "../db/index.js";
import { subscribers, pipelineSubscribers } from "../db/schema/index.js";
import { and, eq, isNull } from "drizzle-orm";

// ================== CREATE ===================

export async function createSubscriber(url: string) {
  const [subscriber] = await db
    .insert(subscribers)
    .values({
      url,
    })
    .returning();

  return subscriber;
}

// ================== READ ===================

export async function listSubscribers(limit: number) {
  return await db
    .select()
    .from(subscribers)
    .where(isNull(subscribers.deletedAt))
    .limit(limit);
}
// ===========================================
export async function getSubscriberById(id: string) {
  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.id, id), isNull(subscribers.deletedAt)));

  return subscriber ?? null;
}
// ===========================================
export async function getSubscriberByUrl(url: string) {
  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.url, url), isNull(subscribers.deletedAt)));

  return subscriber ?? null;
}
// ===========================================
export async function getSubscribersByPipelineId(pipelineId: string) {
  return await db
    .select({
      id: subscribers.id,
      url: subscribers.url,
    })
    .from(pipelineSubscribers)
    .innerJoin(
      subscribers,
      and(
        eq(pipelineSubscribers.subscriberId, subscribers.id),
        isNull(subscribers.deletedAt),
      ),
    )
    .where(eq(pipelineSubscribers.pipelineId, pipelineId));
}

// ================== UPDATE ===================

export async function updateSubscriberUrl(id: string, url: string) {
  const [updated] = await db
    .update(subscribers)
    .set({
      url,
    })
    .where(and(eq(subscribers.id, id), isNull(subscribers.deletedAt)))
    .returning();

  return updated ?? null;
}

// ================== DELETE ===================

export async function deleteSubscriber(id: string) {
  await db.delete(subscribers).where(eq(subscribers.id, id));

  return true;
}

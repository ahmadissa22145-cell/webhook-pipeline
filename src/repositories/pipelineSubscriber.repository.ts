import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  pipelines,
  pipelineSubscribers,
  subscribers,
} from "../db/schema/index.js";

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

// ================== READ ===================

export async function listSubscriptions(limit: number) {
  return await db
    .select({
      id: pipelineSubscribers.id,
      createdAt: pipelineSubscribers.createdAt,
      pipelineId: pipelineSubscribers.pipelineId,
      subscriberId: pipelineSubscribers.subscriberId,

      pipelineName: pipelines.name,
      subscriberUrl: subscribers.url,
    })
    .from(pipelineSubscribers)
    .innerJoin(pipelines, eq(pipelineSubscribers.pipelineId, pipelines.id))
    .innerJoin(
      subscribers,
      eq(pipelineSubscribers.subscriberId, subscribers.id),
    )
    .where(isNull(pipelineSubscribers.unsubscribedAt))
    .limit(limit);
}

export async function getSubscriptionById(id: string) {
  const [subscription] = await db
    .select({
      id: pipelineSubscribers.id,
      pipelineId: pipelineSubscribers.pipelineId,
      subscriberId: pipelineSubscribers.subscriberId,
      createdAt: pipelineSubscribers.createdAt,
      unsubscribedAt: pipelineSubscribers.unsubscribedAt,

      pipelineName: pipelines.name,
      subscriberUrl: subscribers.url,
    })
    .from(pipelineSubscribers)
    .innerJoin(pipelines, eq(pipelineSubscribers.pipelineId, pipelines.id))
    .innerJoin(
      subscribers,
      eq(pipelineSubscribers.subscriberId, subscribers.id),
    )
    .where(
      and(
        eq(pipelineSubscribers.id, id),
        isNull(pipelineSubscribers.unsubscribedAt),
      ),
    );

  return subscription ?? null;
}

// =========================================
export async function getActiveSubscription(
  pipelineId: string,
  subscriberId: string,
) {
  const [subscription] = await db
    .select()
    .from(pipelineSubscribers)
    .where(
      and(
        eq(pipelineSubscribers.pipelineId, pipelineId),
        eq(pipelineSubscribers.subscriberId, subscriberId),
        isNull(pipelineSubscribers.unsubscribedAt),
      ),
    );

  return subscription ?? null;
}
// =========================================
export async function getSubscriptionByPipelineNameAndUrl(
  pipelineName: string,
  subscriberUrl: string,
) {
  const [subscription] = await db
    .select({
      id: pipelineSubscribers.id,
      pipelineId: pipelineSubscribers.pipelineId,
      subscriberId: pipelineSubscribers.subscriberId,
      createdAt: pipelineSubscribers.createdAt,

      pipelineName: pipelines.name,
      subscriberUrl: subscribers.url,
    })
    .from(pipelineSubscribers)
    .innerJoin(pipelines, eq(pipelineSubscribers.pipelineId, pipelines.id))
    .innerJoin(
      subscribers,
      eq(pipelineSubscribers.subscriberId, subscribers.id),
    )
    .where(
      and(
        eq(pipelines.name, pipelineName),
        eq(subscribers.url, subscriberUrl),
        isNull(pipelineSubscribers.unsubscribedAt),
      ),
    );

  return subscription ?? null;
}

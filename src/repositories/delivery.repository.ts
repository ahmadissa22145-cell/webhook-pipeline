import { DeliveryStatus } from "src/types/deliveryStatus.type.js";
import { db } from "../db/index.js";
import { deliveries } from "../db/schema/index.js";
import { and, eq, sql } from "drizzle-orm";

// ================== CREATE ===================

export async function createDelivery(
  jobId: string,
  subscriberId: string,
  deliveredPayload: unknown,
) {
  const [delivery] = await db
    .insert(deliveries)
    .values({
      jobId,
      subscriberId,
      deliveredPayload,
    })
    .returning();

  return delivery;
}

// ================== READ ===================

export async function getDeliveryById(id: string) {
  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, id));

  return delivery ?? null;
}

// ===========================================

export async function getDelivery(jobId: string, subscriberId: string) {
  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(
      and(
        eq(deliveries.jobId, jobId),
        eq(deliveries.subscriberId, subscriberId),
      ),
    );

  return delivery ?? null;
}

// ===========================================

export async function listDeliveries(jobId?: string, limit = 10) {
  const query = db.select().from(deliveries).limit(limit);

  if (jobId) {
    return await query.where(eq(deliveries.jobId, jobId));
  }

  return await query;
}

// ================== UPDATE ===================

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryStatus,
  responseCode?: number,
) {
  const [updated] = await db
    .update(deliveries)
    .set({
      status,
      responseCode,
    })
    .where(eq(deliveries.id, id))
    .returning();

  return updated ?? null;
}

// ===========================================

export async function incrementDeliveryAttempts(id: string) {
  const [updated] = await db
    .update(deliveries)
    .set({
      attempts: sql`${deliveries.attempts} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(deliveries.id, id))
    .returning();

  return updated ?? null;
}

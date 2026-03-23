import { EventType } from "src/types/event.type.js";
import { db } from "../db/index.js";
import { events } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

// ================== CREATE ===================
export async function createEvent(
  pipelineId: string,
  payload: unknown,
  eventType: EventType,
) {
  const [event] = await db
    .insert(events)
    .values({
      eventType,
      payload,
      pipelineId,
    })
    .returning();

  return event;
}

export async function getEventById(id: string) {
  const [event] = await db.select().from(events).where(eq(events.id, id));

  return event ?? null;
}

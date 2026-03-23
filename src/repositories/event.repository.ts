import { EventType } from "src/types/event.type.js";
import { db } from "../db/index.js";
import { events } from "../db/schema/index.js";

// ================== CREATE ===================
export async function createEvent(
  pipelineId: string,
  payload: unknown,
  eventType: EventType
) {
  const [event] = await db
    .insert(events)
    .values({
      eventType,
      payload,
      pipelineId
    })
    .returning();

  return event;
}
import { createEvent } from "../repositories/event.repository.js";
import { BadRequestError } from "../errors/index.js";
import { EventType } from "../types/event.type.js";

// ================== CREATE ===================
export async function createEventService(
  pipelineId: string,
  payload: unknown,
) {
  const trimmedId = pipelineId?.trim();

  if (!trimmedId) {
    throw new BadRequestError("Pipeline id is required");
  }

  if (payload === undefined) {
    throw new BadRequestError("Payload is required");
  }

  return await createEvent(
    trimmedId,
    payload,
    EventType.WEBHOOK,
  );
}


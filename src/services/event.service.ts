import { createEvent, getEventById } from "../repositories/event.repository.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { EventType } from "../types/event.type.js";

// ================== CREATE ===================
export async function createEventService(pipelineId: string, payload: unknown) {
  const trimmedId = pipelineId?.trim();

  if (!trimmedId) throw new BadRequestError("Pipeline id is required");

  if (payload === undefined) throw new BadRequestError("Payload is required");

  return await createEvent(trimmedId, payload, EventType.WEBHOOK);
}

export async function getEventByIdService(id: string) {
  const trimmedId = id?.trim();

  if (!trimmedId) throw new BadRequestError("Pipeline id is required");

  const event = await getEventById(trimmedId);

  if (!event) throw new NotFoundError(`Event with id ${trimmedId} not found`);

  return event;
}

import { createEvent, getEventById } from "../repositories/event.repository.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../errors/index.js";
import { EventType } from "../types/event.type.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ===================
/**
 * Creates an event for a pipeline
 *
 * Why:
 * - Ensure valid pipeline reference before creating event
 * - Enforce payload presence
 * - Standardize event type (WEBHOOK)
 */
export async function createEventService(pipelineId: string, payload: unknown) {
  const trimmedId = trimOrThrow(pipelineId, "Pipeline id");

  // Ensure payload is provided
  if (payload === undefined) {
    throw new BadRequestError("Payload is required");
  }

  // Create event with predefined type
  const event = await createEvent(trimmedId, payload, EventType.WEBHOOK);

  // Defensive check (unexpected DB failure)
  if (!event) {
    throw new InternalServerError("Failed to create event");
  }

  return event;
}
// ================== READ ===================
/**
 * Retrieves an event by ID
 *
 * Why:
 * - Ensure valid input before querying the database
 */
export async function getEventByIdService(id: string) {
  // Normalize and validate input
  const trimmedId = trimOrThrow(id, "Event id");

  // Fetch event from database
  const event = await getEventById(trimmedId);

  // Handle missing job
  if (!event) {
    throw new NotFoundError(`Event not found`);
  }

  return event;
}

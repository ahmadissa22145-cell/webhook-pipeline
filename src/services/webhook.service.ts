import { getSourceByTokenService } from "./source.service.js";
import { getPipelineByIdService } from "./pipeline.service.js";
import { createEventService } from "./event.service.js";
import { jobQueue } from "../queue/job.queue.js";
import { trimOrThrow } from "../utils/validation.js";
import { createJobService } from "./job.service.js";

/**
 * Handles incoming webhook requests
 *
 * Flow:
 * - Validate and resolve the source using the provided token
 * - Identify the associated pipeline
 * - Create an event representing the incoming payload
 * - Create a job to process the event asynchronously
 * - Offload processing to a background queue for scalability
 */

export async function handleWebhookService(token: string, payload: unknown) {
  const trimmedToken = trimOrThrow(token, "Pipeline token");

  const source = await getSourceByTokenService(trimmedToken);

  const pipeline = await getPipelineByIdService(source.pipelineId);

  const event = await createEventService(pipeline.id, payload);

  const job = await createJobService(event.id);

  await jobQueue.add("process-event", {
    jobId: job.id,
    eventId: event.id,
  });

  return true;
}

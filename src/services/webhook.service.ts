import { getSourceByTokenService } from "./source.service.js";
import { getPipelineByIdService } from "./pipeline.service.js";
import { createEventService } from "./event.service.js";
import { jobQueue } from "../queue/job.queue.js";
import { trimOrThrow } from "../utils/validation.js";

export async function handleWebhookService(token: string, payload: unknown) {
  const trimmedToken = trimOrThrow(token, "Pipeline token");

  const source = await getSourceByTokenService(trimmedToken);

  const pipeline = await getPipelineByIdService(source.pipelineId);

  const event = await createEventService(pipeline.id, payload);

  await jobQueue.add("process-event", {
    jobId: event.id,
    eventId: event.id,
  });

  return true;
}

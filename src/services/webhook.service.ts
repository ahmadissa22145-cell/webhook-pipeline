import { BadRequestError } from "../errors/index.js";
import { createEvent } from "../repositories/event.repository.js";
import { createJob } from "../repositories/job.repository.js";
import { jobQueue } from "../queue/job.queue.js";
import { EventType } from "../types/event.type.js";
import { getSourceByTokenService } from "./source.service.js";

export async function handleWebhookService(token: string, payload: unknown) {
  if (!token) throw new BadRequestError("Token is required");

  const source = await getSourceByTokenService(token);

  const event = await createEvent(
    source.pipelineId,
    payload,
    EventType.WEBHOOK,
  );

  const job = await createJob(event.id);

  await jobQueue.add("process-job", {
    jobId: job.id,
    eventId: event.id,
  });
}

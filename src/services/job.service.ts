import { BadRequestError } from "../errors/index.js";
import { createJob } from "../repositories/job.repository.js";
import { getEventByIdService } from "./event.service";

export async function createJobService(eventId: string) {
  if (!eventId) throw new BadRequestError("Event id is required");

  await getEventByIdService(eventId);

  return await createJob(eventId);
}

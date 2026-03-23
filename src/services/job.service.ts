import { JobStatus } from "../types/jobStatus.type.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import {
  createJob,
  getJobById,
  listJobs,
} from "../repositories/job.repository.js";
import { getEventByIdService } from "./event.service.js";

// ================== CREATE ===================
export async function createJobService(eventId: string) {
  const trimmedId = eventId?.trim();
  if (!trimmedId) throw new BadRequestError("Event id is required");

  await getEventByIdService(trimmedId);

  return await createJob(trimmedId);
}

// ================== READ ===================

export async function listJobsService(status?: JobStatus, limit?: number) {
  return await listJobs(status, limit);
}

export async function getJobByIdService(jobId: string) {
  if (!jobId) throw new BadRequestError("Job id is required");

  const job = await getJobById(jobId);

  if (!job) throw new NotFoundError(`Job with id ${jobId} not found`);

  return job;
}

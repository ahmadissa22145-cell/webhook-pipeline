import { JobStatus } from "../types/jobStatus.type.js";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../errors/index.js";
import {
  createJob,
  getJobById,
  incrementJobAttempts,
  listJobs,
  markJobAsProcessed,
  updateJobStatus,
} from "../repositories/job.repository.js";
import { getEventByIdService } from "./event.service.js";

// ================== CREATE ===================
export async function createJobService(eventId: string) {
  const trimmedId = eventId?.trim();
  if (!trimmedId) throw new BadRequestError("Event id is required");

  await getEventByIdService(trimmedId);

  return await createJob(trimmedId);
}

// ================== UPDATE ===================

export async function updateJobStatusService(jobId: string, status: JobStatus) {
  const job = await getJobByIdService(jobId);

  if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED)
    throw new ConflictError(`${job.status.toString()} job cannot be updated`);

  if (job.status === status)
    throw new ConflictError("Job is already in the requested status");

  if (status === JobStatus.COMPLETED && job.status === JobStatus.PENDING) {
    throw new ConflictError(
      "Only processing or retrying jobs can be completed",
    );
  }

  const jobUpdated =
    status === JobStatus.COMPLETED
      ? await markJobAsProcessed(jobId)
      : await updateJobStatus(jobId, status);

  if (!jobUpdated) throw new InternalServerError("Failed to update job status");

  return true;
}

// ===========================================
export async function incrementJobAttemptsService(jobId: string) {
  await getJobById(jobId);

  const attemptsCount = await incrementJobAttempts(jobId);

  if (!attemptsCount)
    throw new InternalServerError("Failed to update job attempts");

  return attemptsCount;
}

// ================== READ ===================

export async function listJobsService(status?: JobStatus, limit?: number) {
  return await listJobs(status, limit);
}

// ===========================================

export async function getJobByIdService(jobId: string) {
  if (!jobId) throw new BadRequestError("Job id is required");

  const job = await getJobById(jobId);

  if (!job) {
    throw new NotFoundError(`Job with id ${jobId} not found`);
  }

  return job;
}

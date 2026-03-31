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
import { trimOrThrow } from "src/utils/validation.js";

// ================== CREATE ===================

/**
 * Creates a job for a given event
 *
 * Why:
 * - Ensure the referenced event exists before creating a job
 * - Maintain data integrity between jobs and events
 */
export async function createJobService(eventId: string) {
  const trimmedId = trimOrThrow(eventId, "Event id");

  // Ensure event exists before creating job
  await getEventByIdService(trimmedId);

  // Create job in database
  const job = await createJob(trimmedId);

  // Defensive check (unexpected DB failure)
  if (!job) {
    throw new InternalServerError("Failed to create job");
  }

  return job;
}

// ================== UPDATE ===================

/**
 * Updates the status of a job
 *
 * Why:
 * - Enforce valid state transitions
 * - Prevent updates on finalized jobs (COMPLETED / FAILED)
 * - Avoid redundant or invalid status changes
 */
export async function updateJobStatusService(jobId: string, status: JobStatus) {
  const trimmedJobId = trimOrThrow(jobId, "Job id");

  // Ensure job exists before updating
  const job = await getJobByIdService(trimmedJobId);

  // Prevent modifying a finalized job
  if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
    throw new ConflictError(`${job.status} job cannot be updated`);
  }

  // Prevent setting the same status again
  if (job.status === status) {
    throw new ConflictError("Job is already in the requested status");
  }

  // Enforce valid transition rules
  if (status === JobStatus.COMPLETED && job.status === JobStatus.PENDING) {
    throw new ConflictError(
      "Only processing or retrying jobs can be completed",
    );
  }

  // Update job status (special handling for completion)
  const updatedJob =
    status === JobStatus.COMPLETED
      ? await markJobAsProcessed(trimmedJobId)
      : await updateJobStatus(trimmedJobId, status);

  // Defensive check (unexpected DB failure)
  if (!updatedJob) {
    throw new InternalServerError("Failed to update job status");
  }

  return true;
}

// ===========================================

/**
 * Increments the number of job attempts
 *
 * Why:
 * - Track retry attempts for job execution
 * - Support retry and failure handling mechanisms
 */
export async function incrementJobAttemptsService(jobId: string) {
  const trimmedJobId = trimOrThrow(jobId, "Job id");

  // Ensure job exists before updating attempts
  await getJobByIdService(trimmedJobId);

  // Increment attempts count in database
  const attemptsCount = await incrementJobAttempts(trimmedJobId);

  // Defensive check (unexpected DB failure)
  if (!attemptsCount) {
    throw new InternalServerError("Failed to update job attempts");
  }

  return attemptsCount;
}

// ================== READ ===================

/**
 * Lists jobs with optional filtering and pagination.
 *
 * Why:
 * - Support querying jobs by status
 * - Enforce valid pagination input
 */
export async function listJobsService(status?: JobStatus, limit?: number) {
  // Validate pagination input
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be positive");
  }

  // Fetch jobs with optional status filter and default limit
  return await listJobs(status, limit ?? 10);
}

// ===========================================

/**
 * Retrieves a job by ID
 *
 * Why:
 * - Ensure valid input before querying the database
 * - Provide clear error if job does not exist
 */
export async function getJobByIdService(jobId: string) {
  // Normalize and validate input
  const trimmedJobId = trimOrThrow(jobId, "Job id");

  // Fetch job from database
  const job = await getJobById(trimmedJobId);

  // Handle missing job
  if (!job) {
    throw new NotFoundError("Job not found");
  }

  return job;
}

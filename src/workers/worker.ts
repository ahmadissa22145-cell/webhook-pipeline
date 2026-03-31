import { Worker } from "bullmq";
import { connection } from "../queue/job.queue.js";
import { processPayloadService } from "../services/processing.service.js";
import { JobStatus } from "../types/jobStatus.type.js";
import {
  getJobByIdService,
  incrementJobAttemptsService,
  updateJobStatusService,
} from "../services/job.service.js";
import { getPipelineByIdService } from "../services/pipeline.service.js";
import { getEventByIdService } from "../services/event.service.js";

import { logger } from "../utils/logger.js";
import { getSubscribersByPipelineIdService } from "../services/subscriber.service.js";
import { deliverToSubscribersWithRetry } from "./delivery.js";

/**
 * Worker that processes queued jobs for events
 *
 * Flow:
 * - Fetch job → validate status
 * - Get event → pipeline → process payload
 * - If result is null → mark as SKIPPED
 * - Send processed data to subscribers with retry
 * - Mark job as COMPLETED
 *
 * Error Handling:
 * - Increment attempts on failure
 * - Retry up to maxAttempts
 * - Mark job as FAILED if max retries reached
 *
 * Design:
 * - Uses BullMQ worker for async processing
 * - Decouples request handling from execution (event-driven architecture)
 */

const maxAttempts = 3; // job attempts

new Worker(
  "job-queue",
  async (job) => {
    const { jobId, eventId } = job.data;

    // Load job from DB to track its current state
    const storedJob = await getJobByIdService(jobId);

    // Skip processing if job already finalized
    if (
      storedJob.status === JobStatus.COMPLETED ||
      storedJob.status === JobStatus.FAILED
    ) {
      return;
    }

    // Determine current status (retry vs first processing)
    const status =
      job.attemptsMade > 0 ? JobStatus.RETRYING : JobStatus.PROCESSING;

    await updateJobStatusService(jobId, status);

    try {
      // 1. get event
      const event = await getEventByIdService(eventId);

      // 2. get pipeline
      const pipeline = await getPipelineByIdService(event.pipelineId);

      // 3. process payload
      const result = await processPayloadService(
        pipeline.processingActionType,
        event.payload,
      );

      // If pipeline decides to skip → stop job early
      if (result === null) {
        logger.info(
          `Process action skipped by job with id ${jobId} for event with id ${eventId}`,
        );
        await updateJobStatusService(jobId, JobStatus.SKIPPED);

        return;
      }

      // 4. get subscribers
      const subscribers = await getSubscribersByPipelineIdService(pipeline.id);

      // 5. Deliver processed result with retry mechanism
      const DeliveryResults = await deliverToSubscribersWithRetry(
        subscribers,
        jobId,
        eventId,
        result,
      );

      logger.info(DeliveryResults);

      // 6. Mark job as successfully completed
      await updateJobStatusService(jobId, JobStatus.COMPLETED);
    } catch (error) {
      // Increment retry attempts in DB
      await incrementJobAttemptsService(jobId);

      // If max retries reached mark as FAILED
      if (job.attemptsMade + 1 >= maxAttempts) {
        await updateJobStatusService(jobId, JobStatus.FAILED);
      }

      throw error;
    }
  },
  { connection },
);

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

const maxAttempts = 3; // job attempts

new Worker(
  "job-queue",
  async (job) => {
    const { jobId, eventId } = job.data;

    const storedJob = await getJobByIdService(jobId);

    if (
      storedJob.status === JobStatus.COMPLETED ||
      storedJob.status === JobStatus.FAILED
    ) {
      return;
    }

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

      // 4. get subscribers
      const subscribers = await getSubscribersByPipelineIdService(pipeline.id);

      // 5. send ruslts to subs
      const DeliveryResults = await deliverToSubscribersWithRetry(
        subscribers,
        jobId,
        eventId,
        result,
      );

      logger.info(DeliveryResults);

      // 6. job done
      await updateJobStatusService(jobId, JobStatus.COMPLETED);
    } catch (error) {
      await incrementJobAttemptsService(jobId);

      if (job.attemptsMade >= maxAttempts) {
        await updateJobStatusService(jobId, JobStatus.FAILED);
      }

      throw error;
    }
  },
  { connection },
);

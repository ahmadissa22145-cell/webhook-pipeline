import {
  createSubscription,
  getActiveSubscription,
  getSubscriptionById,
} from "../repositories/pipelineSubscriber.repository.js";
import {
  BadRequestError,
  InternalServerError,
  ConflictError,
  NotFoundError,
} from "../errors/index.js";
import { getPipelineByIdService } from "./pipeline.service.js";
import { getSubscriberByIdService } from "./subscriber.service.js";

// ================== CREATE ===================

export async function subscribeService(
  pipelineId: string,
  subscriberId: string,
) {
  const trimmedPipelineId = pipelineId?.trim();
  const trimmedSubscriberId = subscriberId?.trim();

  if (!trimmedPipelineId || !trimmedSubscriberId) {
    throw new BadRequestError("Pipeline ID and Subscriber ID are required");
  }

  await getPipelineByIdService(trimmedPipelineId);
  await getSubscriberByIdService(trimmedSubscriberId);

  const existing = await getActiveSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (existing) {
    throw new ConflictError("Subscriber already subscribed to this pipeline");
  }

  const subscription = await createSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (!subscription) {
    throw new InternalServerError("Failed to create subscription");
  }

  return subscription;
}

// ========================================
export async function getSubscriptionByIdService(id: string) {
  const trimmedId = id?.trim();

  if (!trimmedId) {
    throw new BadRequestError("Subscription ID is required");
  }

  const subscription = await getSubscriptionById(trimmedId);

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  return subscription;
}

// ==========================================
export async function checkSubscriptionService(
  pipelineId: string,
  subscriberId: string,
) {
  const trimmedPipelineId = pipelineId?.trim();
  const trimmedSubscriberId = subscriberId?.trim();

  if (!trimmedPipelineId || !trimmedSubscriberId) {
    throw new BadRequestError("Pipeline ID and Subscriber ID are required");
  }

  const subscription = await getActiveSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  return subscription;
}

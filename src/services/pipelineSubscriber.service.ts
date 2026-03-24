import {
  createSubscription,
  getActiveSubscription,
  getPipelinesBySubscriberId,
  getSubscriptionById,
  getSubscriptionByPipelineNameAndUrl,
  listSubscriptions,
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

// ================== READ ================
export async function listSubscriptionsService(limit?: number) {
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be positive");
  }

  return await listSubscriptions(limit ?? 10);
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
// ==========================================
export async function getSubscriptionByNameAndUrlService(
  pipelineName: string,
  subscriberUrl: string,
) {
  const trimmedName = pipelineName?.trim();
  const trimmedUrl = subscriberUrl?.trim();

  if (!trimmedName || !trimmedUrl) {
    throw new BadRequestError("Pipeline name and subscriber URL are required");
  }

  let validUrl: string;
  try {
    validUrl = new URL(trimmedUrl).toString();
  } catch {
    throw new BadRequestError("Invalid URL format");
  }

  const subscription = await getSubscriptionByPipelineNameAndUrl(
    trimmedName,
    validUrl,
  );

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  return subscription;
}

// ==========================================

export async function getPipelinesBySubscriberIdService(subscriberId: string) {
  const trimmedId = subscriberId?.trim();

  if (!trimmedId) {
    throw new BadRequestError("Subscriber ID is required");
  }

  //check if exists
  await getSubscriberByIdService(trimmedId);

  const pipelines = await getPipelinesBySubscriberId(trimmedId);

  return pipelines;
}

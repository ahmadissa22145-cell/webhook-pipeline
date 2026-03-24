import {
  createSubscription,
  getSubscriptionById,
} from "../repositories/pipelineSubscriber.repository.js";

import { BadRequestError } from "../errors/BadRequestError.js";
import { InternalServerError } from "../errors/InternalServerError.js";

import { getPipelineByIdService } from "./pipeline.service.js";
import { getSubscriberByIdService } from "./subscriber.service.js";
import { NotFoundError } from "../errors/NotFoundError.js";

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

  const subscription = await createSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (!subscription) {
    throw new InternalServerError("Failed to create subscription");
  }

  return subscription;
}

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

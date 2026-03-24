import { createSubscription } from "../repositories/pipelineSubscriber.repository.js";

import { BadRequestError } from "../errors/BadRequestError.js";
import { InternalServerError } from "../errors/InternalServerError.js";

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

  const subscription = await createSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (!subscription) {
    throw new InternalServerError("Failed to create subscription");
  }

  return subscription;
}

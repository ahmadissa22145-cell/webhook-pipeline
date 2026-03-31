import {
  createSubscription,
  getActiveSubscription,
  getPipelinesBySubscriberId,
  getSubscriptionById,
  getSubscriptionByPipelineNameAndUrl,
  listSubscriptions,
  unsubscribe,
  unsubscribeByID,
} from "../repositories/pipelineSubscriber.repository.js";

import {
  BadRequestError,
  InternalServerError,
  ConflictError,
  NotFoundError,
} from "../errors/index.js";

import { getPipelineByIdService } from "./pipeline.service.js";
import { getSubscriberByIdService } from "./subscriber.service.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ===================

/**
 * Subscribes a subscriber to a pipeline
 *
 * Why:
 * - Ensure pipeline and subscriber exist
 * - Prevent duplicate active subscriptions
 * - Maintain data integrity
 */
export async function subscribeService(
  pipelineId: string,
  subscriberId: string,
) {
  const trimmedPipelineId = trimOrThrow(pipelineId, "Pipeline id");
  const trimmedSubscriberId = trimOrThrow(subscriberId, "Subscriber id");

  // Ensure related entities exist
  await getPipelineByIdService(trimmedPipelineId);
  await getSubscriberByIdService(trimmedSubscriberId);

  // Prevent duplicate subscription
  const existing = await getActiveSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (existing) {
    throw new ConflictError("Subscriber already subscribed to this pipeline");
  }

  // Create subscription
  const subscription = await createSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  // Defensive check
  if (!subscription) {
    throw new InternalServerError("Failed to create subscription");
  }

  return subscription;
}

// ================== READ ===================

/**
 * Lists subscriptions with optional pagination
 *
 * Why:
 * - Support pagination
 * - Ensure valid limit input
 */
export async function listSubscriptionsService(limit?: number) {
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be positive");
  }

  return listSubscriptions(limit ?? 10);
}

/**
 * Retrieves a subscription by ID
 *
 * Why:
 * - Ensure valid input
 * - Provide clear error if not found
 */
export async function getSubscriptionByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Subscription id");

  const subscription = await getSubscriptionById(trimmedId);

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  return subscription;
}

/**
 * Retrieves active subscription for pipeline & subscriber
 *
 * Why:
 * - Validate subscription existence
 * - Used for checks and business rules
 */
export async function getActiveSubscriptionService(
  pipelineId: string,
  subscriberId: string,
) {
  const trimmedPipelineId = trimOrThrow(pipelineId, "Pipeline id");
  const trimmedSubscriberId = trimOrThrow(subscriberId, "Subscriber id");

  const subscription = await getActiveSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  return subscription;
}

/**
 * Retrieves subscription by pipeline name and subscriber URL
 *
 * Why:
 * - Validate URL format
 * - Support lookup using human-readable identifiers
 */
export async function getSubscriptionByNameAndUrlService(
  pipelineName: string,
  subscriberUrl: string,
) {
  const trimmedName = trimOrThrow(pipelineName, "Pipeline name");
  const trimmedUrl = trimOrThrow(subscriberUrl, "Subscriber url");

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

/**
 * Retrieves pipelines subscribed by a specific subscriber
 *
 * Why:
 * - Ensure subscriber exists
 * - Provide relationship data
 */
export async function getPipelinesBySubscriberIdService(subscriberId: string) {
  const trimmedId = trimOrThrow(subscriberId, "Subscriber id");

  // Ensure subscriber exists
  await getSubscriberByIdService(trimmedId);

  const subscription = await getPipelinesBySubscriberId(trimmedId);

  if (!subscription) {
    throw new NotFoundError("Subscription not found");
  }

  return subscription;
}

// ================== DELETE ===================

/**
 * Unsubscribes a subscriber from a pipeline
 *
 * Why:
 * - Ensure entities exist
 * - Prevent unsubscribing non-existing subscriptions
 *
 * Note:
 * - This operation performs a soft delete, not a hard delete
 * - The actual soft deletion is handled by a database Before DELETE trigger
 * - The trigger updates the unsubscribde at to current date & time
 * - This design keeps deletion logic centralized at the database level
 * - This approach protects records from accidental deletion
 * - It also preserves historical data for auditing and debugging
 * - Deletion logic is centralized at the database level
 */
export async function unsubscribeService(
  pipelineId: string,
  subscriberId: string,
) {
  const trimmedPipelineId = trimOrThrow(pipelineId, "Pipeline id");
  const trimmedSubscriberId = trimOrThrow(subscriberId, "Subscriber id");

  // Ensure entities exist
  await getPipelineByIdService(trimmedPipelineId);
  await getSubscriberByIdService(trimmedSubscriberId);

  // Ensure active subscription exists
  const existing = await getActiveSubscription(
    trimmedPipelineId,
    trimmedSubscriberId,
  );

  if (!existing) {
    throw new NotFoundError("Subscription not found or already unsubscribed");
  }

  const updated = await unsubscribe(trimmedPipelineId, trimmedSubscriberId);

  if (!updated) {
    throw new InternalServerError("Failed to unsubscribe");
  }

  return true;
}

/**
 * Unsubscribes using subscription ID
 *
 * Why:
 * - Support deletion by identifier
 * - Ensure subscription exists before update
 *
 * Note:
 * - This operation performs a soft delete, not a hard delete
 * - The actual soft deletion is handled by a database Before DELETE trigger
 * - The trigger updates the unsubscribde at to current date & time
 * - This design keeps deletion logic centralized at the database level
 * - This approach protects records from accidental deletion
 * - It also preserves historical data for auditing and debugging
 * - Deletion logic is centralized at the database level
 */
export async function unsubscribeByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Subscription id");

  // Ensure subscription exists
  await getSubscriptionByIdService(trimmedId);

  await unsubscribeByID(trimmedId);

  return true;
}

import {
  createSubscriber,
  listSubscribers,
  getSubscriberById,
  getSubscriberByUrl,
  getSubscribersByPipelineId,
  updateSubscriberUrl,
  deleteSubscriber,
} from "../repositories/subscriber.repository.js";

import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "../errors/index.js";

import { getPipelineByIdService } from "./pipeline.service.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ===================

/**
 * Creates a subscriber
 *
 * Why:
 * - Ensure valid URL format
 * - Prevent duplicate subscribers by URL
 * - Maintain data integrity
 */
export async function createSubscriberService(url: string) {
  // Normalize and validate input
  const trimmedUrl = trimOrThrow(url, "Subscriber url");

  let validUrl: string;

  try {
    validUrl = new URL(trimmedUrl).toString();
  } catch {
    throw new BadRequestError("Invalid URL format");
  }

  // Prevent duplicate subscriber
  const existing = await getSubscriberByUrl(validUrl);
  if (existing) {
    throw new ConflictError("Subscriber with this URL already exists");
  }

  // Create subscriber
  const subscriber = await createSubscriber(validUrl);

  // Defensive check
  if (!subscriber) {
    throw new InternalServerError("Failed to create subscriber");
  }

  return subscriber;
}

// ================== READ ===================

/**
 * Lists subscribers with optional pagination
 */
export async function listSubscribersService(limit?: number) {
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be a positive number");
  }

  return listSubscribers(limit ?? 10);
}

// ===========================================

/**
 * Retrieves a subscriber by ID
 *
 * Why:
 * - Ensure valid input
 * - Provide clear error if not found
 */
export async function getSubscriberByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Subscriber id");

  const subscriber = await getSubscriberById(trimmedId);

  if (!subscriber) {
    throw new NotFoundError("Subscriber not found");
  }

  return subscriber;
}

// ===========================================

/**
 * Retrieves a subscriber by URL
 *
 * Why:
 * - Ensure valid input
 * - Support URL-based lookup
 */
export async function getSubscriberByUrlService(url: string) {
  const trimmedUrl = trimOrThrow(url, "Subscriber url");

  const subscriber = await getSubscriberByUrl(trimmedUrl);

  if (!subscriber) {
    throw new NotFoundError("Subscriber not found");
  }

  return subscriber;
}

// ===========================================

/**
 * Retrieves subscribers associated with a pipeline
 *
 * Why:
 * - Ensure pipeline exists
 * - Provide relationship data
 */
export async function getSubscribersByPipelineIdService(pipelineId: string) {
  const trimmedPipelineId = trimOrThrow(pipelineId, "Pipeline id");

  // Ensure pipeline exists
  await getPipelineByIdService(trimmedPipelineId);

  const subscribers = await getSubscribersByPipelineId(trimmedPipelineId);

  return subscribers ?? [];
}

// ================== UPDATE ===================

/**
 * Updates subscriber URL
 *
 * Why:
 * - Ensure valid input
 * - Prevent duplicate URLs
 * - Prevent redundant updates
 */
export async function updateSubscriberUrlService(id: string, url: string) {
  const trimmedId = trimOrThrow(id, "Subscriber id");
  const trimmedUrl = trimOrThrow(url, "Subscriber url");

  let validUrl: string;

  try {
    validUrl = new URL(trimmedUrl).toString();
  } catch {
    throw new BadRequestError("Invalid URL format");
  }

  // Ensure subscriber exists
  const subscriber = await getSubscriberByIdService(trimmedId);

  // Prevent same URL
  if (subscriber.url === validUrl) {
    throw new ConflictError("URL is already the same");
  }

  // Prevent duplicate URL
  const existing = await getSubscriberByUrl(validUrl);
  if (existing) {
    throw new ConflictError("Another subscriber with this URL already exists");
  }

  const updated = await updateSubscriberUrl(trimmedId, validUrl);

  // Defensive check
  if (!updated) {
    throw new InternalServerError("Failed to update subscriber");
  }

  return true;
}

// ================== DELETE ===================

/**
 * Deletes a subscriber
 *
 * Why:
 * - Ensure subscriber exists before deletion
 *
 * Note:
 * - Deletion is implemented as a soft delete
 * - A database BEFORE DELETE trigger is responsible for:
 *   - Marking the subscriber as deleted (e.g., setting deletedAt)
 *   - Soft-deleting all related subscriptions and pipeline relationships
 * - This protects data from accidental loss and preserves historical records
 * - All cascading logic is centralized at the database level
 */
export async function deleteSubscriberService(id: string) {
  const trimmedId = trimOrThrow(id, "Subscriber id");

  // Ensure subscriber exists
  await getSubscriberByIdService(trimmedId);

  const deleted = await deleteSubscriber(trimmedId);

  // Defensive check
  if (!deleted) {
    throw new InternalServerError("Failed to delete subscriber");
  }

  return true;
}

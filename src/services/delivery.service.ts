import {
  createDelivery,
  getDeliveryById,
  getDelivery,
  listDeliveries,
  updateDeliveryStatus,
  incrementDeliveryAttempts,
} from "../repositories/delivery.repository.js";

import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../errors/index.js";

import { getJobByIdService } from "./job.service.js";
import { getSubscriberByIdService } from "./subscriber.service.js";
import { DeliveryStatus } from "../types/deliveryStatus.type.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ===================

/**
 * Creates a delivery record
 *
 * Why:
 * - Maintain data integrity
 * - Avoid duplicate deliveries
 */
export async function createDeliveryService(
  jobId: string,
  subscriberId: string,
  deliveredPayload: unknown,
) {
  const trimmedJobId = trimOrThrow(jobId, "Job id");
  const trimmedSubscriberId = trimOrThrow(subscriberId, "Subscriber id");

  // Ensure related entities exist before creating delivery
  await getJobByIdService(trimmedJobId);
  await getSubscriberByIdService(trimmedSubscriberId);

  // Prevent duplicate delivery for same job & subscriber
  const existing = await getDelivery(trimmedJobId, trimmedSubscriberId);
  if (existing) {
    throw new ConflictError("Delivery already exists");
  }

  // Create delivery in database
  const delivery = await createDelivery(
    trimmedJobId,
    trimmedSubscriberId,
    deliveredPayload,
  );

  // Defensive check (unexpected DB failure)
  if (!delivery) {
    throw new InternalServerError("Failed to create delivery");
  }

  return delivery;
}

// ================== UPDATE ===================

/**
 * Updates the status of a delivery
 *
 * Why:
 * - Enforce valid state transitions
 * - Prevent updates on finalized deliveries (DELIVERED / FAILED)
 * - Avoid redundant or invalid status changes
 */
export async function updateDeliveryStatusService(
  deliveryId: string,
  status: DeliveryStatus,
  responseCode?: number,
) {
  const trimmedId = trimOrThrow(deliveryId, "Delivery id");

  // Ensure delivery exists before updating
  const delivery = await getDeliveryByIdService(trimmedId);

  // Prevent modifying a finalized delivery
  if (
    delivery.status === DeliveryStatus.DELIVERED ||
    delivery.status === DeliveryStatus.FAILED
  ) {
    throw new ConflictError(`${delivery.status} delivery cannot be updated`);
  }

  // Prevent setting the same status again
  if (delivery.status === status) {
    throw new ConflictError("Delivery is already in the requested status");
  }

  // Enforce valid transition rules
  if (status === DeliveryStatus.DELIVERED && delivery.status === DeliveryStatus.PENDING) {
    throw new ConflictError(
      "Only sending or retrying deliveries can be marked as delivered",
    );
  }

  // Update delivery status in database
  const updatedDelivery = await updateDeliveryStatus(trimmedId, status, responseCode);

  // Defensive check (unexpected DB failure)
  if (!updatedDelivery) {
    throw new InternalServerError("Failed to update delivery");
  }

  return true;
}

// ===========================================

/**
 * Increments the number of delivery attempts
 *
 * Why:
 * - Track retry attempts for delivery
 * - Support retry mechanisms and failure handling
 */
export async function incrementDeliveryAttemptsService(deliveryId: string) {
  const trimmedId = trimOrThrow(deliveryId, "Delivery id");

  // Ensure Delivery exists before updating attempts
  await getDeliveryByIdService(trimmedId);

  // Increment attempts count in database
  const updatedDelivery = await incrementDeliveryAttempts(trimmedId);

  // Defensive check (unexpected DB failure)
  if (!updatedDelivery) {
    throw new InternalServerError("Failed to increment attempts");
  }

  return updatedDelivery.attempts;
}

// ================== READ ===================

/**
 * Retrieves a delivery by ID
 *
 * Why:
 * - Ensure valid input before querying the database
 * - Provide clear error handling if delivery does not exist
 */
export async function getDeliveryByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Delivery id");

  // Fetch delivery from database
  const delivery = await getDeliveryById(trimmedId);

  // Handle missing delivery
  if (!delivery) {
    throw new NotFoundError("Delivery not found");
  }

  return delivery;
}

// ===========================================

/**
 * Lists deliveries with optional filtering and pagination
 *
 * Why:
 * - Support querying deliveries by job id
 * - Enforce valid pagination input
 */
export async function listDeliveriesService(jobId?: string, limit?: number) {
  // Validate pagination input
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be positive");
  }

  // Fetch deliveries with optional job filter and default limit
  return await listDeliveries(jobId?.trim(), limit ?? 10);
}

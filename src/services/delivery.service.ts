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

export async function createDeliveryService(
  jobId: string,
  subscriberId: string,
  deliveredPayload: unknown,
) {
  const trimmedJobId = trimOrThrow(jobId, "Job id");
  const trimmedSubscriberId = trimOrThrow(subscriberId, "Subscriber id");

  await getJobByIdService(trimmedJobId);
  await getSubscriberByIdService(trimmedSubscriberId);

  const existing = await getDelivery(trimmedJobId, trimmedSubscriberId);

  if (existing) {
    throw new ConflictError("Delivery already exists");
  }

  const delivery = await createDelivery(
    trimmedJobId,
    trimmedSubscriberId,
    deliveredPayload,
  );

  if (!delivery) {
    throw new InternalServerError("Failed to create delivery");
  }

  return delivery;
}

// ================== UPDATE ===================

export async function updateDeliveryStatusService(
  deliveryId: string,
  status: DeliveryStatus,
  responseCode?: number,
) {
  const trimmedId = trimOrThrow(deliveryId, "Dekivery id");

  const delivery = await getDeliveryByIdService(trimmedId);

  if (
    delivery.status === DeliveryStatus.DELIVERED ||
    delivery.status === DeliveryStatus.FAILED
  ) {
    throw new ConflictError(`${delivery.status} delivery cannot be updated`);
  }

  const updated = await updateDeliveryStatus(trimmedId, status, responseCode);

  if (!updated) {
    throw new InternalServerError("Failed to update delivery");
  }

  return true;
}

// ===========================================

export async function incrementDeliveryAttemptsService(deliveryId: string) {
  const trimmedId = trimOrThrow(deliveryId, "Dekivery id");

  const updated = await incrementDeliveryAttempts(trimmedId);

  if (!updated) {
    throw new InternalServerError("Failed to increment attempts");
  }

  return updated.attempts;
}

// ================== READ ===================

export async function getDeliveryByIdService(id: string) {
  const trimmedId = trimOrThrow(id, "Dekivery id");

  if (!trimmedId) throw new BadRequestError("Delivery ID is required");

  const delivery = await getDeliveryById(trimmedId);

  if (!delivery) {
    throw new NotFoundError("Delivery not found");
  }

  return delivery;
}

// ===========================================

export async function listDeliveriesService(jobId?: string, limit?: number) {
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be positive");
  }

  return await listDeliveries(jobId?.trim(), limit ?? 10);
}

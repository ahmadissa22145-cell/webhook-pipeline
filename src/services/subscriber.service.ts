import {
  createSubscriber,
  listSubscribers,
  getSubscriberById,
  getSubscriberByUrl,
  getSubscribersByPipelineId,
  updateSubscriberUrl,
  deleteSubscriber,
} from "../repositories/subscriber.repository.js";

import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ConflictError } from "../errors/ConflictError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { getPipelineByIdService } from "./pipeline.service.js";

// ================== CREATE ===================

export async function createSubscriberService(url: string) {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    throw new BadRequestError("Subscriber Url is required");
  }
  let validUrl;
  
  try {
    validUrl = new URL(trimmedUrl).toString();
  } catch {
    throw new BadRequestError("Invalid URL format");
  }

  const existing = await getSubscriberByUrl(validUrl);
  if (existing) {
    throw new ConflictError("Subscriber with this URL already exists");
  }

  const subscriber = await createSubscriber(validUrl);

  if (!subscriber) {
    throw new InternalServerError("Failed to create subscriber");
  }

  return subscriber;
}

// ================== READ ===================

export async function listSubscribersService(limit?: number) {
  if (limit !== undefined && limit <= 0) {
    throw new BadRequestError("Limit must be a positive number");
  }

  return await listSubscribers(limit ?? 10);
}

// ===========================================

export async function getSubscriberByIdService(id: string) {
  const trimmedId = id?.trim();
  if (!trimmedId) throw new BadRequestError("Subscriber ID is required");

  const subscriber = await getSubscriberById(trimmedId);

  if (!subscriber) {
    throw new NotFoundError("Subscriber not found");
  }

  return subscriber;
}
// ===========================================
export async function getSubscriberByUrlService(url: string) {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl) throw new BadRequestError("Subscriber url is required");

  const subscriber = await getSubscriberByUrl(trimmedUrl);

  if (!subscriber) {
    throw new NotFoundError("Subscriber not found");
  }

  return subscriber;
}

// ===========================================

export async function getSubscribersByPipelineIdService(pipelineId: string) {
  const trimmedPipelineId = pipelineId?.trim();
  if (!trimmedPipelineId) {
    throw new BadRequestError("Pipeline ID is required");
  }

  await getPipelineByIdService(trimmedPipelineId);

  return await getSubscribersByPipelineId(trimmedPipelineId);
}

// ================== UPDATE ===================

export async function updateSubscriberUrlService(id: string, url: string) {
  const trimmedId = id?.trim();
  if (!trimmedId) throw new BadRequestError("Subscriber ID is required");

  const trimmedUrl = url?.trim();
  if (!trimmedUrl) {
    throw new BadRequestError("URL is required");
  }

  const subscriber = await getSubscriberByIdService(trimmedId);

  if (subscriber.url === trimmedUrl) {
    throw new ConflictError("URL is already the same");
  }

  const existing = await getSubscriberByUrl(trimmedUrl);
  if (existing) {
    throw new ConflictError("Another subscriber with this URL already exists");
  }

  const updated = await updateSubscriberUrl(trimmedId, trimmedUrl);

  if (!updated) {
    throw new InternalServerError("Failed to update subscriber");
  }

  return updated;
}

// ================== DELETE ===================

export async function deleteSubscriberService(id: string) {
  const trimmedId = id?.trim();
  if (!trimmedId) throw new BadRequestError("Subscriber ID is required");

  await getSubscriberByIdService(trimmedId);

  const isDeleted = await deleteSubscriber(trimmedId);

  if (!isDeleted) {
    throw new InternalServerError("Failed to delete subscriber");
  }

  return true;
}

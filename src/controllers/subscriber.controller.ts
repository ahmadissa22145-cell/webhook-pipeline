import { Request, Response, NextFunction } from "express";

import {
  createSubscriberService,
  listSubscribersService,
  getSubscriberByIdService,
  getSubscriberByUrlService,
  getSubscribersByPipelineIdService,
  updateSubscriberUrlService,
  deleteSubscriberService,
} from "../services/subscriber.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";

// ================== CREATE ===================

export async function createSubscriberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { url } = req.body as { url: string };

    const trimmedUrl = url?.trim();

    if (!trimmedUrl) throw new BadRequestError("Subscriber Url is required");

    const subscriber = await createSubscriberService(trimmedUrl);

    res.status(201).json({
      data: subscriber,
    });
  } catch (error) {
    next(error);
  }
}

// ================== READ ===================

export async function listSubscribersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { limit, url } = req.query as { limit?: string; url?: string };

    const parsedLimit = limit ? Number(limit) : undefined;

    const parsedUrl = url?.trim() ?? undefined;

    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit <= 0)) {
      throw new BadRequestError("Limit must be a positive number");
    }

    let subscribers;
    if (parsedUrl !== undefined) {
      subscribers = await getSubscriberByUrlService(parsedUrl);
    } else {
      subscribers = await listSubscribersService(parsedLimit);
    }

    res.status(200).json({
      data: subscribers,
    });
  } catch (error) {
    next(error);
  }
}

// ===========================================

export async function getSubscriberByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const trimmedId = id?.trim();

    if (!trimmedId) throw new BadRequestError("Subscriber id is required");

    const subscriber = await getSubscriberByIdService(trimmedId);

    res.status(200).json({
      data: subscriber,
    });
  } catch (error) {
    next(error);
  }
}

// ===========================================

export async function getSubscribersByPipelineIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pipelineId } = req.params as { pipelineId: string };

    const trimmedPipelineId = pipelineId?.trim();

    if (!trimmedPipelineId)
      throw new BadRequestError("Pipeline id is required");

    const subscribers =
      await getSubscribersByPipelineIdService(trimmedPipelineId);

    res.status(200).json({
      data: subscribers,
    });
  } catch (error) {
    next(error);
  }
}

// ================== UPDATE ===================

export async function updateSubscriberUrlController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { url } = req.body as { url: string };

    const trimmedId = id?.trim();

    if (!trimmedId) throw new BadRequestError("Subscriber id is required");

    const trimmedUrl = url?.trim();

    if (!trimmedUrl) throw new BadRequestError("Subscriber Url is required");

    const updated = await updateSubscriberUrlService(trimmedId, trimmedUrl);

    res.status(200).json({
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ================== DELETE ===================

export async function deleteSubscriberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const trimmedId = id?.trim();

    if (!trimmedId) throw new BadRequestError("Subscriber id is required");

    await deleteSubscriberService(trimmedId);

    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
}

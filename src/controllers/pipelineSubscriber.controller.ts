import { Request, Response, NextFunction } from "express";
import {
  checkSubscriptionService,
  getSubscriptionByIdService,
  getSubscriptionByNameAndUrlService,
  listSubscriptionsService,
  subscribeService,
} from "../services/pipelineSubscriber.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";

// ================== CREATE ===================

export async function subscribeController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pipelineId, subscriberId } = req.body as {
      pipelineId: string;
      subscriberId: string;
    };

    const trimmedPipelineId = pipelineId?.trim();
    const trimmedSubscriberId = subscriberId?.trim();

    if (!trimmedPipelineId || !trimmedSubscriberId) {
      throw new BadRequestError("Pipeline ID and Subscriber ID are required");
    }

    const subscription = await subscribeService(
      trimmedPipelineId,
      trimmedSubscriberId,
    );

    res.status(201).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

// ================== READ ================
export async function listSubscriptionsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { limit } = req.query as { limit?: string };

    const parsedLimit = limit ? Number(limit) : undefined;

    const subscriptions = await listSubscriptionsService(parsedLimit);

    res.status(200).json({
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
}

// ========================================
export async function getSubscriptionByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const trimmedId = id?.trim();

    if (!trimmedId) {
      throw new BadRequestError("Subscription ID is required");
    }
    const subscription = await getSubscriptionByIdService(trimmedId);

    res.status(200).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}
// ========================================
export async function getSubscriptionByNameAndUrlController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pipelineName, subscriberUrl } = req.query as {
      pipelineName: string;
      subscriberUrl: string;
    };

    const trimmedName = pipelineName?.trim();
    const trimmedUrl = subscriberUrl?.trim();

    if (!trimmedName || !trimmedUrl) {
      throw new BadRequestError(
        "Pipeline name and subscriber URL are required",
      );
    }

    const subscription = await getSubscriptionByNameAndUrlService(
      trimmedName,
      trimmedUrl,
    );

    res.status(200).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

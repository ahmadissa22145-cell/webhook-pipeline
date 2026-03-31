import { Request, Response, NextFunction } from "express";
import {
  getPipelinesBySubscriberIdService,
  getSubscriptionByIdService,
  getSubscriptionByNameAndUrlService,
  listSubscriptionsService,
  subscribeService,
  unsubscribeByIdService,
  unsubscribeService,
} from "../services/pipelineSubscriber.service.js";
import { trimOrThrow } from "../utils/validation.js";

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

    const subscription = await subscribeService(
      trimOrThrow(pipelineId, "Pipeline id"),
      trimOrThrow(subscriberId, "Subscriber id"),
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

    const subscription = await getSubscriptionByIdService(
      trimOrThrow(id, "Subscription id"),
    );

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

    const subscription = await getSubscriptionByNameAndUrlService(
      trimOrThrow(pipelineName, "Pipeline name"),
      trimOrThrow(subscriberUrl, "Subscriber url"),
    );

    res.status(200).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}
// ========================================
export async function getPipelinesBySubscriberIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { subscriberId } = req.params as { subscriberId: string };

    const pipelines = await getPipelinesBySubscriberIdService(
      trimOrThrow(subscriberId, "Subscriber id"),
    );

    res.status(200).json({
      data: pipelines,
    });
  } catch (error) {
    next(error);
  }
}

// ================= DELETE ====================
export async function unsubscribeController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pipelineId, subscriberId } = req.query as {
      pipelineId: string;
      subscriberId: string;
    };

    await unsubscribeService(
      trimOrThrow(pipelineId, "Pipeline id"),
      trimOrThrow(subscriberId, "Subscriber id"),
    );

    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
}

export async function unsubscribeByIDController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as {
      id: string;
    };

    await unsubscribeByIdService(trimOrThrow(id, "Subscription id"));

    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
}

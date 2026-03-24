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
import { BadRequestError } from "../errors/BadRequestError.js";
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
// ========================================
export async function getPipelinesBySubscriberIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { subscriberId } = req.params as { subscriberId: string };

    const pipelines = await getPipelinesBySubscriberIdService(
      trimOrThrow(subscriberId),
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

    const trimmedPipelineId = pipelineId?.trim();
    const trimmedSubscriberId = subscriberId?.trim();

    if (!trimmedPipelineId || !trimmedSubscriberId) {
      throw new BadRequestError("Pipeline ID and Subscriber ID are required");
    }

    await unsubscribeService(trimmedPipelineId, trimmedSubscriberId);

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

    const trimmedId = id?.trim();

    if (!trimmedId) {
      throw new BadRequestError("Subscription ID are required");
    }

    await unsubscribeByIdService(trimmedId);

    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
}

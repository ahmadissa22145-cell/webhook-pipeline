import { Request, Response, NextFunction } from "express";
import {
  checkSubscriptionService,
  getSubscriptionByIdService,
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

export async function checkSubscriptionController(
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
      throw new BadRequestError("Pipeline ID and Subscriber ID is required");
    }

    const subscription = await checkSubscriptionService(
      trimmedPipelineId,
      trimmedSubscriberId,
    );

    res.status(200).json({
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
}

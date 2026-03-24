import { Request, Response, NextFunction } from "express";
import { subscribeService } from "../services/pipelineSubscriber.service.js";
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

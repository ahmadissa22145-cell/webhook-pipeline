import { Request, Response, NextFunction } from "express";
import {
  getDeliveryByIdService,
  listDeliveriesService,
} from "../services/delivery.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== READ ===================

export async function getDeliveryByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const trimmedId = trimOrThrow(id);

    const delivery = await getDeliveryByIdService(trimmedId);

    res.status(200).json({ data: delivery });
  } catch (err) {
    next(err);
  }
}

// ===========================================

export async function listDeliveriesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { jobId, limit } = req.query as { jobId?: string; limit?: string };

    const parsedLimit = limit ? Number(limit) : undefined;
    const parsedjobId = jobId?.trim();

    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit <= 0))
      throw new BadRequestError("Limit must be a positive number");

    const deliveries = await listDeliveriesService(parsedjobId, parsedLimit);

    res.status(200).json({ data: deliveries });
  } catch (err) {
    next(err);
  }
}

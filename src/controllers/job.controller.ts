import { Request, Response, NextFunction } from "express";
import { listJobsService, getJobByIdService } from "../services/job.service.js";
import { BadRequestError } from "../errors/index.js";
import { JobStatus } from "../types/jobStatus.type.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== READ ===================

export async function listJobsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status, limit } = req.query as {
      status?: string;
      limit?: string;
    };

    const parsedLimit = limit ? Number(limit) : undefined;
    const parsedStatus = status ? Number(status) : undefined;

    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit <= 0))
      throw new BadRequestError("Limit must be a positive number");

    if (
      parsedStatus !== undefined &&
      (isNaN(parsedStatus) || parsedStatus > 4 || parsedStatus < 0)
    )
      throw new BadRequestError(
        "Status must be a positive number between 0 and 4",
      );

    const jobs = await listJobsService(parsedStatus as JobStatus, parsedLimit);

    res.status(200).json({
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
}

// ===========================================

export async function getJobByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const job = await getJobByIdService(trimOrThrow(id, "Job id"));

    res.status(200).json({
      data: job,
    });
  } catch (error) {
    next(error);
  }
}

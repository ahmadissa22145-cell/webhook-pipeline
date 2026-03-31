import { Request, Response, NextFunction } from "express";
import {
  createSourceService,
  deleteSourceService,
  getSourceByIdService,
  getSourceByTokenService,
  listSourcesService,
  updateSourceStatusService,
} from "../services/source.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { trimOrThrow } from "../utils/validation.js";

// ================== CREATE ===================

export async function createSourceController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pipelineId } = req.body as {
      pipelineId: string;
    };

    const source = await createSourceService(
      trimOrThrow(pipelineId, "Pipeline id"),
    );

    res.status(201).json({
      data: source,
    });
  } catch (error) {
    next(error);
  }
}

// ================== UPDATE ===================
export async function updateSourceStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { isActive } = req.body as { isActive: boolean };

    if (typeof isActive !== "boolean") {
      throw new BadRequestError("isActive must be true or false");
    }

    const source = await updateSourceStatusService(
      trimOrThrow(id, "Source id"),
      isActive,
    );

    res.status(200).json({
      data: source,
    });
  } catch (error) {
    next(error);
  }
}

// ================== READ ===================

export async function getSourceByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const source = await getSourceByIdService(trimOrThrow(id, "Source id"));

    res.status(200).json({
      data: source,
    });
  } catch (error) {
    next(error);
  }
}

// ===========================================

export async function getSourceByTokenController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.params as { token: string };

    const source = await getSourceByTokenService(
      trimOrThrow(token, "Source token"),
    );

    res.status(200).json({
      data: source,
    });
  } catch (error) {
    next(error);
  }
}

// ===========================================

export async function listSourcesController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sources = await listSourcesService();

    res.status(200).json({
      data: sources,
    });
  } catch (error) {
    next(error);
  }
}

// ================== DELETE ===================
export async function deleteSourceController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    await deleteSourceService(trimOrThrow(id, "Source id"));

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

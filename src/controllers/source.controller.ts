import { Request, Response, NextFunction } from "express";
import {
  createSourceService,
  getSourceByIdService,
  getSourceByTokenService,
  listSourcesService,
} from "../services/source.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";

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

    if (!pipelineId?.trim()) {
      throw new BadRequestError("pipelineId are required");
    }

    const source = await createSourceService(pipelineId.trim());

    res.status(201).json({
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

    const timmedId = id?.trim();

    if (!timmedId) throw new BadRequestError("Source id is required");

    const source = await getSourceByIdService(timmedId);

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

    const trimmedToken = token?.trim();

    if (!trimmedToken) throw new BadRequestError("Source token is required");

    const source = await getSourceByTokenService(trimmedToken);

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

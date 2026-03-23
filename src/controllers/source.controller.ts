import { Request, Response, NextFunction } from "express";
import {
  getSourceByIdService,
  getSourceByTokenService,
  listSourcesService,
} from "../services/source.service.js";
import { BadRequestError } from "../errors/BadRequestError.js";

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

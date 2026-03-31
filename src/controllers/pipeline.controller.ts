import { Request, Response, NextFunction } from "express";
import { NewPipeline } from "../db/schema/index.js";
import {
  createPipelineService,
  deletePipelineByIdService,
  deletePipelineByNameService,
  deletePipelineService,
  getAllPipelinesService,
  getPipelineByIdService,
  getPipelineByNameService,
  isPipelineDeletedByNameService,
  isPipelineDeletedService,
  updatePipelineService,
} from "../services/pipeline.service.js";
import { z } from "zod";
import { BadRequestError } from "../errors/BadRequestError.js";
import { trimOrThrow } from "../utils/validation.js";

const createPipelineSchema = z.object({
  name: z.string(),
  processingActionType: z.number(),
});

const updatePipelineSchema = z.object({
  name: z.string().optional(),
  processingActionType: z.number().optional(),
});

// ================== CREATE ==================
export async function createPipelineController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pipelineData: NewPipeline = createPipelineSchema.parse(req.body);

    if (pipelineData.processingActionType === undefined)
      throw new BadRequestError("Processing action type is required");

    const pipeline = await createPipelineService(
      trimOrThrow(pipelineData.name, "Pipeline name"),
      pipelineData.processingActionType,
    );

    return res.status(201).json({
      data: pipeline,
    });
  } catch (error) {
    next(error);
  }
}

// ================== UPDATE ==================
export async function updatePipelineController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const pipelineData = updatePipelineSchema.parse(req.body);

    if (!pipelineData.name && pipelineData.processingActionType === undefined)
      throw new BadRequestError("At least one field is required");

    const updatedPipeline = await updatePipelineService(
      trimOrThrow(id, "Pipeline id"),
      pipelineData.name?.trim(),
      pipelineData.processingActionType,
    );

    if (updatedPipeline === null) {
      return res.status(404).json({
        error: "Pipeline was not found",
      });
    }

    return res.status(200).json({ data: updatedPipeline });
  } catch (error) {
    next(error);
  }
}

// ================== READ ==================
export async function getAllPipelinesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const storedPipelines = await getAllPipelinesService();

    const message =
      storedPipelines.length === 0
        ? "No pipelines found"
        : "Pipelines retrieved successfully";

    return res.status(200).json({ data: storedPipelines, message: message });
  } catch (error) {
    next(error);
  }
}

export async function getPipelineByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const pipeline = await getPipelineByIdService(
      trimOrThrow(id, "Pipeline id"),
    );

    if (!pipeline) return res.status(404).json({ error: "Pipeline not found" });

    return res.status(200).json({ data: pipeline });
  } catch (error) {
    next(error);
  }
}

export async function getPipelineByNameController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name } = req.params as { name: string };

    const pipeline = await getPipelineByNameService(
      trimOrThrow(name, "Pipeline name"),
    );

    if (!pipeline) return res.status(404).json({ error: "Pipeline not found" });

    return res.status(200).json({ data: pipeline });
  } catch (error) {
    next(error);
  }
}

export async function isPipelineDeletedController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };

    const isDeleted = await isPipelineDeletedService(
      trimOrThrow(id, "Pipeline id"),
    );

    return res.status(200).json({ isDeleted: isDeleted });
  } catch (error) {
    next(error);
  }
}

export async function isPipelineDeletedByNameController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name } = req.params as { name: string };

    const isDeleted = await isPipelineDeletedByNameService(
      trimOrThrow(name, "Pipeline name"),
    );

    return res.status(200).json({ isDeleted: isDeleted });
  } catch (error) {
    next(error);
  }
}

// ================== DELETE ==================
export async function deletePipelineController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, name } = req.params as {
      id: string;
      name: string;
    };

    const field = id ? "id" : "name";
    const value = id ?? name;

    const trimmedValue = trimOrThrow(value, field);

    const pipelineHandlers = buildPipelineHandlers(field);

    await deletePipelineService(
      trimmedValue,
      pipelineHandlers.fnGetPipeline,
      pipelineHandlers.fnDeletePipeline,
    );

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function buildPipelineHandlers(field: "id" | "name") {
  const fnGetPipeline =
    field === "id" ? getPipelineByIdService : getPipelineByNameService;

  const fnDeletePipeline =
    field === "id" ? deletePipelineByIdService : deletePipelineByNameService;

  return {
    fnGetPipeline,
    fnDeletePipeline,
  };
}

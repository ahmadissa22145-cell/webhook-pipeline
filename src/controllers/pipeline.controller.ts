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

    pipelineData.name = trimOrThrow(pipelineData.name, "Pipeline name");

    if (pipelineData.processingActionType === undefined)
      throw new BadRequestError("Processing action type is required");

    const pipeline = await createPipelineService(pipelineData);

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
    const { pipelineId } = req.params as { pipelineId: string };
    const pipelineData = updatePipelineSchema.parse(req.body);

    const trimmedPipelineId = trimOrThrow(pipelineId, "Pipeline id");

    if (!pipelineData.name && pipelineData.processingActionType === undefined)
      throw new BadRequestError("At least one field is required");

    const updatedPipeline = await updatePipelineService(
      trimmedPipelineId,
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
      trimOrThrow(id, "Pipeline id")
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
    const { pipelineId } = req.params as { pipelineId: string };

    const isDeleted = await isPipelineDeletedService(
      trimOrThrow(pipelineId, "Pipeline id"),
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
    const { pipelineName } = req.params as { pipelineName: string };

    const isDeleted = await isPipelineDeletedByNameService(
      trimOrThrow(pipelineName, "Pipeline name"),
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
    const { pipelineId, pipelineName } = req.params as {
      pipelineId: string;
      pipelineName: string;
    };

    const field = pipelineId ? "id" : "name";
    const value = pipelineId ?? pipelineName;

    const trimmedValue = trimOrThrow(value, field);

    const pipelineHandlers = buildPipelineHandlers(field);

    await deletePipelineService(
      trimmedValue,
      field,
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

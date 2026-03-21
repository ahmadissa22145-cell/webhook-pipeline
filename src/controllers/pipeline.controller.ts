import { Request, Response, NextFunction } from "express";
import { NewPipeline } from "../db/schema/index.js";
import {
  createPipelineService,
  getAllPipelinesService,
  updatePipelineService,
} from "../services/pipeline.service.js";
import { z } from "zod";
import { BadRequestError } from "../errors/BadRequestError.js";

const createPipelineSchema = z.object({
  name: z.string(),
  processingActionType: z.number(),
});

const updatePipelineSchema = z.object({
  name: z.string().optional(),
  processingActionType: z.number().optional(),
});

export async function createPipelineController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pipelineData: NewPipeline = createPipelineSchema.parse(req.body);

    const pipeline = await createPipelineService(pipelineData);

    return res.status(201).json({
      data: pipeline,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePipelineController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { pipelineId } = req.params as { pipelineId: string };
    const pipelineData = updatePipelineSchema.parse(req.body);

    if (!pipelineId?.trim())
      throw new BadRequestError("Pipeline id is required");

    if (!pipelineData.name && pipelineData.processingActionType === undefined)
      throw new BadRequestError("At least one field is required");

    const updatedPipeline = await updatePipelineService(
      pipelineId,
      pipelineData.name,
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

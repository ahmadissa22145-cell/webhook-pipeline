import { Request, Response, NextFunction } from "express";
import { NewPipeline } from "../db/schema/index.js";
import { createPipelineService } from "../services/pipeline.service.js";
import { z } from "zod";

const createPipelineSchema = z.object({
  name: z.string(),
  processingActionType: z.number(),
});

export async function createPipelineController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pipelineData: NewPipeline = createPipelineSchema.parse(req.body);

    const pipeline = await createPipelineService(pipelineData);

    res.status(201).json({
      data: pipeline,
    });
    
  } catch (error) {
    next(error);
  }
}

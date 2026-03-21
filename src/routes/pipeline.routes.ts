import { Router } from "express";
import {
  createPipelineController,
  updatePipelineController,
} from "../controllers/pipeline.controller.js";

export const pipelineRoutes = Router();

pipelineRoutes.post("/pipelines", createPipelineController);

pipelineRoutes.patch("/pipelines/:pipelineId", updatePipelineController);

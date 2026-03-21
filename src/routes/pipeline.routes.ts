import { Router } from "express";
import {
  createPipelineController,
  getAllPipelinesController,
  getPipelineByIdController,
  updatePipelineController,
} from "../controllers/pipeline.controller.js";

export const pipelineRoutes = Router();

pipelineRoutes.post("/pipelines", createPipelineController);

pipelineRoutes.patch("/pipelines/:pipelineId", updatePipelineController);

pipelineRoutes.get("/pipelines", getAllPipelinesController);

pipelineRoutes.get("/pipelines/:pipelineId", getPipelineByIdController);

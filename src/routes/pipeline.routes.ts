import { Router } from "express";
import {
  createPipelineController,
  getAllPipelinesController,
  updatePipelineController,
} from "../controllers/pipeline.controller.js";

export const pipelineRoutes = Router();

pipelineRoutes.post("/pipelines", createPipelineController);

pipelineRoutes.patch("/pipelines/:pipelineId", updatePipelineController);

pipelineRoutes.get("/pipelines", getAllPipelinesController);

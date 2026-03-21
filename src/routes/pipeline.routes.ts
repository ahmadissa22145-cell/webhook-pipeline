import { Router } from "express";
import { createPipelineController } from "../controllers/pipeline.controller.js";

export const pipelineRoutes = Router();

pipelineRoutes.post("/pipelines", createPipelineController);

import { Router } from "express";
import {
  createPipelineController,
  deletePipelineController,
  getAllPipelinesController,
  getPipelineByIdController,
  getPipelineByNameController,
  isPipelineDeletedController,
  isPipelineDeletedByNameController,
  updatePipelineController,
} from "../controllers/pipeline.controller.js";

export const pipelineRoutes = Router();

// ========== CREATE ===========
pipelineRoutes.post("/pipelines", createPipelineController);

// ========== UPDATE ==========
pipelineRoutes.patch("/pipelines/:id", updatePipelineController);

// ========== READ ==========
pipelineRoutes.get("/pipelines", getAllPipelinesController);

// by id
pipelineRoutes.get("/pipelines/:id", getPipelineByIdController);

// by name
pipelineRoutes.get("/pipelines/by-name/:name", getPipelineByNameController);

// ========== STATUS ==========
pipelineRoutes.get("/pipelines/:id/is-deleted", isPipelineDeletedController);

pipelineRoutes.get(
  "/pipelines/by-name/:name/is-deleted",
  isPipelineDeletedByNameController,
);

// ========== DELETE ==========
pipelineRoutes.delete("/pipelines/:id", deletePipelineController);

pipelineRoutes.delete("/pipelines/by-name/:name", deletePipelineController);

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

const pipelineRoutes = Router();

// ========== CREATE ===========
pipelineRoutes.post("/", createPipelineController);

// ========== UPDATE ==========
pipelineRoutes.patch("/:id", updatePipelineController);

// ========== READ ==========
pipelineRoutes.get("/", getAllPipelinesController);

// by id
pipelineRoutes.get("/:id", getPipelineByIdController);

// by name
pipelineRoutes.get("/by-name/:name", getPipelineByNameController);

// ========== STATUS ==========
pipelineRoutes.get("/:id/is-deleted", isPipelineDeletedController);

pipelineRoutes.get(
  "/by-name/:name/is-deleted",
  isPipelineDeletedByNameController,
);

// ========== DELETE ==========
pipelineRoutes.delete("/:id", deletePipelineController);

pipelineRoutes.delete("/by-name/:name", deletePipelineController);

export default pipelineRoutes;

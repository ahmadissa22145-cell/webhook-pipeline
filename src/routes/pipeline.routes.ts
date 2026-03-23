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

const pipelineRouter = Router();

// ========== CREATE ===========
pipelineRouter.post("/", createPipelineController);

// ========== UPDATE ==========
pipelineRouter.patch("/:id", updatePipelineController);

// ========== READ ==========
pipelineRouter.get("/", getAllPipelinesController);

// by id
pipelineRouter.get("/:id", getPipelineByIdController);

// by name
pipelineRouter.get("/by-name/:name", getPipelineByNameController);

// ========== STATUS ==========
pipelineRouter.get("/:id/is-deleted", isPipelineDeletedController);

pipelineRouter.get(
  "/by-name/:name/is-deleted",
  isPipelineDeletedByNameController,
);

// ========== DELETE ==========
pipelineRouter.delete("/:id", deletePipelineController);

pipelineRouter.delete("/by-name/:name", deletePipelineController);

export default pipelineRouter;

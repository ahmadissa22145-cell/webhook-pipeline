import { Router } from "express";
import {
  createSourceController,
  deleteSourceController,
  getSourceByIdController,
  getSourceByTokenController,
  listSourcesController,
  updateSourceStatusController,
} from "../controllers/source.controller.js";

const sourceRouter = Router();

// ========== CREATE ==========
sourceRouter.post("/", createSourceController);

// ========== UPDATE ==========
sourceRouter.patch("/:id/status", updateSourceStatusController);

// ========== READ ==========
sourceRouter.get("/", listSourcesController);

// by token
sourceRouter.get("/by-token/:token", getSourceByTokenController);

// by id
sourceRouter.get("/:id", getSourceByIdController);

// ========== DELETE ==========
sourceRouter.delete("/:id", deleteSourceController);

export default sourceRouter;

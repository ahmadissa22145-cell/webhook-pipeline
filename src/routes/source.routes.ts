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

sourceRouter.get("/", listSourcesController);
sourceRouter.get("/by-token/:token", getSourceByTokenController);
sourceRouter.get("/:id", getSourceByIdController);

sourceRouter.post("/", createSourceController);
sourceRouter.patch("/:id/status", updateSourceStatusController);

sourceRouter.delete("/:id", deleteSourceController);

export default sourceRouter;

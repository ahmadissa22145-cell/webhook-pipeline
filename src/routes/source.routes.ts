import { Router } from "express";
import {
  createSourceController,
  getSourceByIdController,
  getSourceByTokenController,
  listSourcesController,
} from "../controllers/source.controller.js";

const sourceRouter = Router();

sourceRouter.get("/", listSourcesController);
sourceRouter.get("/by-token/:token", getSourceByTokenController);
sourceRouter.get("/:id", getSourceByIdController);

sourceRouter.post("/", createSourceController);

export default sourceRouter;

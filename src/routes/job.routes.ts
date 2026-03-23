import { Router } from "express";
import {
  listJobsController,
  getJobByIdController,
} from "../controllers/job.controller.js";

const jobRouter = Router();

// ========== READ ==========

jobRouter.get("/", listJobsController);

jobRouter.get("/:id", getJobByIdController);

export default jobRouter;

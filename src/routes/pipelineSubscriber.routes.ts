import { Router } from "express";
import {
  checkSubscriptionController,
  getSubscriptionByIdController,
  subscribeController,
} from "../controllers/pipelineSubscriber.controller.js";

const pipelineSubscriberRouter = Router();

// ================== CREATE ===================

pipelineSubscriberRouter.post("/", subscribeController);

// ================== READ ===================
pipelineSubscriberRouter.get("/", checkSubscriptionController);
pipelineSubscriberRouter.get("/:id", getSubscriptionByIdController);

export default pipelineSubscriberRouter;

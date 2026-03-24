import { Router } from "express";
import {
  getSubscriptionByIdController,
  subscribeController,
} from "../controllers/pipelineSubscriber.controller.js";

const pipelineSubscriberRouter = Router();

// ================== SUBSCRIBE ===================

pipelineSubscriberRouter.post("/", subscribeController);
pipelineSubscriberRouter.get("/:id", getSubscriptionByIdController);

export default pipelineSubscriberRouter;

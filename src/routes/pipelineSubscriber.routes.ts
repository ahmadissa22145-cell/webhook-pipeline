import { Router } from "express";
import {
  getSubscriptionByIdController,
  getSubscriptionByNameAndUrlController,
  listSubscriptionsController,
  subscribeController,
} from "../controllers/pipelineSubscriber.controller.js";

const pipelineSubscriberRouter = Router();

// ================== CREATE ===================

pipelineSubscriberRouter.post("/", subscribeController);

// ================== READ ===================
pipelineSubscriberRouter.get("/search", getSubscriptionByNameAndUrlController);
pipelineSubscriberRouter.get("/:id", getSubscriptionByIdController);
pipelineSubscriberRouter.get("/", listSubscriptionsController);

export default pipelineSubscriberRouter;

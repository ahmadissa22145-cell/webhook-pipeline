import { Router } from "express";
import {
  getPipelinesBySubscriberIdController,
  getSubscriptionByIdController,
  getSubscriptionByNameAndUrlController,
  listSubscriptionsController,
  subscribeController,
} from "../controllers/pipelineSubscriber.controller.js";

const pipelineSubscriberRouter = Router();

// ================== CREATE ===================

pipelineSubscriberRouter.post("/", subscribeController);

// ================== READ ===================
pipelineSubscriberRouter.get(
  "/:subscriberId/pipelines",
  getPipelinesBySubscriberIdController,
);
pipelineSubscriberRouter.get("/search", getSubscriptionByNameAndUrlController);
pipelineSubscriberRouter.get("/:id", getSubscriptionByIdController);
pipelineSubscriberRouter.get("/", listSubscriptionsController);

export default pipelineSubscriberRouter;

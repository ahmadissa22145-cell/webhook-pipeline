import { Router } from "express";

import {
  createSubscriberController,
  listSubscribersController,
  getSubscriberByIdController,
  getSubscribersByPipelineIdController,
  updateSubscriberUrlController,
  deleteSubscriberController,
} from "../controllers/subscriber.controller.js";

const subscriberRouter = Router();

// ================== CREATE ===================
subscriberRouter.post("/", createSubscriberController);

// ================== READ ===================

subscriberRouter.get("/", listSubscribersController);

subscriberRouter.get(
  "/by-pipelineId/:pipelineId",
  getSubscribersByPipelineIdController,
);

subscriberRouter.get("/:id", getSubscriberByIdController);

// ================== UPDATE ===================
subscriberRouter.patch("/:id", updateSubscriberUrlController);

// ================== DELETE ===================
subscriberRouter.delete("/:id", deleteSubscriberController);

export default subscriberRouter;

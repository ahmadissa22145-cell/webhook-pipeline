import { Router } from "express";
import { subscribeController } from "../controllers/pipelineSubscriber.controller.js";

const pipelineSubscriberRouter = Router();

// ================== SUBSCRIBE ===================

pipelineSubscriberRouter.post("/", subscribeController);

export default pipelineSubscriberRouter;

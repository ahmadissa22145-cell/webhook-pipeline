import { Router } from "express";
import { handleWebhookController } from "../controllers/webhook.controller.js";

const webhookRouter = Router();

webhookRouter.post("/:token", handleWebhookController);

export default webhookRouter;

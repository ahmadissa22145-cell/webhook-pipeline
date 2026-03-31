import { Request, Response, NextFunction } from "express";
import { handleWebhookService } from "../services/webhook.service.js";
import { trimOrThrow } from "../utils/validation.js";

export async function handleWebhookController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.params as { token: string };

    await handleWebhookService(trimOrThrow(token, "Pipeline token"), req.body);

    res.status(202).json({
      message: "Webhook received",
    });
  } catch (error) {
    next(error);
  }
}

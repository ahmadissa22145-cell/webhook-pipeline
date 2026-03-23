import { Request, Response, NextFunction } from "express";
import { handleWebhookService } from "../services/webhook.service.js";

export async function handleWebhookController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.params as { token: string };

    await handleWebhookService(token, req.body);

    res.status(202).json({
      message: "Webhook received",
    });
  } catch (error) {
    next(error);
  }
}

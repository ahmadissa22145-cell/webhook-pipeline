import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export function errorLoggerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof Error) {
    logger.error("\n\n\n ERROR START ------------------------");

    logger.error(`Message: ${err.message}`);
    logger.error(`Stack: ${err.stack}`);

    logger.error("Request:");
    logger.error(`  Method: ${req.method}`);
    logger.error(`  URL: ${req.originalUrl}`);
    logger.error(`  Params: ${JSON.stringify(req.params, null, 2)}`);
    logger.error(`  Query: ${JSON.stringify(req.query, null, 2)}`);
    logger.error(`  Body: ${JSON.stringify(req.body, null, 2)}`);

    logger.error("🚨 ERROR END --------------------------\n");
  }

  next(err);
}

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorLoggerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  
  if (err instanceof Error) {
    logger.error({
      message: err.message,
      stack: err.stack,

      request: {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
      },
    });
  }

  next(err);
}

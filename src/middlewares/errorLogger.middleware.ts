import { Request, Response, NextFunction } from "express";
import { logger } from "src/utils/logger.js";

export function errorLoggerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof Error) {
    logger.error(
      {
        err,
        path: req.url,
        method: req.method,
      },
      err.message,
    );
  }

  next(err);
}

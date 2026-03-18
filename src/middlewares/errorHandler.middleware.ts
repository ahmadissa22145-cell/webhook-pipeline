import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

type ErrorWithStatus = Error & { statusCode?: number };

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  void next;

  if (err instanceof ZodError) {
    return res.status(400).json({
      errors: err.issues,
    });
  }

  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof Error) {
    const e = err as ErrorWithStatus;

    statusCode = e.statusCode ?? 500;
    message = statusCode === 500 ? "Internal server error" : e.message;
  }

  return res.status(statusCode).json({
    error: message,
  });
}

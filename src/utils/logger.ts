import pino from "pino";
import "dotenv/config";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  pino.destination("./logs/app.log"),
);

import { Queue } from "bullmq";

export const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: 6379,
};

export const jobQueue = new Queue("job-queue", {
  connection,
});

import express from "express";
import pipelineRoutes from "./routes/pipeline.routes.js";
import { errorLoggerMiddleware } from "./middlewares/errorLogger.middleware.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import sourceRouter from "./routes/source.routes.js";
import jobRouter from "./routes/job.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import subscriberRouter from "./routes/subscriber.routes.js";
import pipelineSubscriberRouter from "./routes/pipelineSubscriber.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";

const app = express();

app.use(express.json());

app.use("/api/pipelines", pipelineRoutes);
app.use("/api/sources", sourceRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/subscribers", subscriberRouter);
app.use("/api/pipeline-subscribers", pipelineSubscriberRouter);
app.use("/api/deliveries", deliveryRouter);
app.use("/api/webhooks", webhookRouter);

app.use(errorLoggerMiddleware);
app.use(errorHandlerMiddleware);

// start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from "express";
import { pipelineRoutes } from "./routes/pipeline.routes.js";
import { errorLoggerMiddleware } from "./middlewares/errorLogger.middleware.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(express.json());

app.use("/api", pipelineRoutes);

app.use(errorLoggerMiddleware);
app.use(errorHandlerMiddleware);

// start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

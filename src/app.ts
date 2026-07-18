import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";

const app: Application = express();

// Middleware
app.use(cors());

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

// Test route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "API is running 🚀",
  });
});

// 404 handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;

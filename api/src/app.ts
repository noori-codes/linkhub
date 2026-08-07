import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRouter from "./routes/user.routes.js";
import profileRouter from "./routes/profile.routes.js";
import linkRouter from "./routes/link.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import productRouter from "./routes/product.routes.js";
import themeRouter from "./routes/theme.routes.js";
import collectionRouter from "./routes/collection.routes.js";

const app: Application = express();

// Allow the Next.js app (port 3001) to call this API from the browser
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://192.168.0.111:3001",
    ],
    credentials: true,
  }),
);

app.use(helmet());

// Needed so protect() can read the jwt cookie set on login/signup
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/profiles", profileRouter);
app.use("/api/v1/links", linkRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/themes", themeRouter);
app.use("/api/v1/collections", collectionRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;

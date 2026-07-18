import path from "path";
import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
// import rateLimit from "express-rate-limit";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";
// import hpp from "hpp";
// import cookieParser from "cookie-parser";
// import compression from "compression";
import cors from "cors";

// import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";

// import tourRouter from "./routes/tourRoutes";
// import userRouter from "./routes/userRoutes";
// import reviewRouter from "./routes/reviewRoutes";
// import bookingRouter from "./routes/bookingRoutes";
// import viewRouter from "./routes/viewRoutes";

// import bookingController from "./controllers/bookingController";

const app: Application = express();

// Required behind Render / Heroku proxy
app.set("trust proxy", 1);

// ======================================
// GLOBAL MIDDLEWARE
// ======================================

// Enable CORS
app.use(cors());
app.options("*", cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net",
          "https://js.stripe.com",
        ],
        styleSrc: [
          "'self'",
          "https://unpkg.com",
          "https://fonts.googleapis.com",
          "'unsafe-inline'",
        ],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          "https://unpkg.com",
          "https://checkout.stripe.com",
        ],
        workerSrc: ["'self'", "blob:"],
        fontSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookies
app.use(cookieParser());

// NoSQL Injection
// app.use(mongoSanitize());

// XSS
// app.use(xss());

// HTTP Parameter Pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingQuantity",
//       "ratingAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price",
//     ],
//   }),
// );

// Compression
app.use(compression());

// Custom middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ======================================
// ROUTES
// ======================================

// app.use("/", viewRouter);
// app.use("/api/v1/tours", tourRouter);
// app.use("/api/v1/users", userRouter);
// app.use("/api/v1/reviews", reviewRouter);
// app.use("/api/v1/bookings", bookingRouter);

// 404
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;

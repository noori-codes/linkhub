import type { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError.js";

interface MongoError extends Error {
  path?: string;
  value?: unknown;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;

  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}
const handleCastErrorDB = (err: MongoError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  // keyValue looks like { username: "noori" } or { email: "a@b.com" }
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : undefined;
  const value = field && err.keyValue ? String(err.keyValue[field]) : undefined;

  if (field === "username") {
    return new AppError(
      value
        ? `Username "${value}" is already taken. Please choose another.`
        : "That username is already taken. Please choose another.",
      400,
    );
  }

  if (field === "email") {
    return new AppError(
      "An account with that email already exists. Try logging in.",
      400,
    );
  }

  const message = value
    ? `Duplicate field value: ${value}. Please use another value!`
    : "Duplicate field value. Please use another value!";

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: MongoError): AppError => {
  const errors = Object.values(err.errors ?? {}).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("ERROR 💥", err);

  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

const globalErrorHandler = (
  err: MongoError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Turn ugly Mongo/JWT errors into clear AppErrors (dev AND prod)
  let finalError = err as AppError;

  if (err.name === "CastError") {
    finalError = handleCastErrorDB(err);
  } else if (err.code === 11000) {
    finalError = handleDuplicateFieldsDB(err);
  } else if (err.name === "ValidationError") {
    finalError = handleValidationErrorDB(err);
  } else if (err.name === "JsonWebTokenError") {
    finalError = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    finalError = handleJWTExpiredError();
  }

  if (process.env.NODE_ENV === "development") {
    // Friendly message for the UI; stack still logged for you
    console.log("🔥 ERROR:", err);
    return res.status(finalError.statusCode || 500).json({
      status: finalError.status || "error",
      message: finalError.message,
      error: err,
      stack: err.stack,
    });
  }

  return sendErrorProd(finalError, req, res);
};

export default globalErrorHandler;

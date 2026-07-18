import express from "express";
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
  const value = err.keyValue ? JSON.stringify(err.keyValue) : "unknown field";

  const message = `Duplicate field value: ${value}. Please use another value!`;

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

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

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

  const error = { ...err } as MongoError & {
    statusCode: number;
    isOperational?: boolean;
  };

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(error as AppError, req, res);
  }

  let finalError = error as AppError;

  if (error.name === "CastError") {
    finalError = handleCastErrorDB(error);
  }

  if (error.code === 11000) {
    finalError = handleDuplicateFieldsDB(error);
  }

  if (error.name === "ValidationError") {
    finalError = handleValidationErrorDB(error);
  }

  if (error.name === "JsonWebTokenError") {
    finalError = handleJWTError();
  }

  if (error.name === "TokenExpiredError") {
    finalError = handleJWTExpiredError();
  }

  return sendErrorProd(finalError, req, res);
};

export default globalErrorHandler;

import type { FitEnum } from "sharp";
import sharp from "sharp";
import type { Request, Response, NextFunction } from "express";

import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

async function resizeToJpeg(
  buffer: Buffer,
  width: number,
  height: number,
  fit: keyof FitEnum = "cover",
) {
  return sharp(buffer)
    .rotate()
    .resize(width, height, { fit, position: "centre" })
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
}

function applyJpegBuffer(req: Request, buffer: Buffer) {
  if (!req.file) return;
  req.file.buffer = buffer;
  req.file.mimetype = "image/jpeg";
  req.file.size = buffer.length;
  // Controllers key off mimetype → always .jpg after compression
  req.file.originalname = req.file.originalname.replace(/\.[^.]+$/, ".jpg");
}

/** Square avatar — same idea as Natours `resizeUserPhoto` (500×500). */
export const resizeAvatar = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();

    try {
      applyJpegBuffer(
        req,
        await resizeToJpeg(req.file.buffer, 500, 500, "cover"),
      );
      next();
    } catch {
      next(
        new AppError("Could not process that image. Try another file.", 400),
      );
    }
  },
);

export const resizeCover = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();

    try {
      applyJpegBuffer(
        req,
        await resizeToJpeg(req.file.buffer, 1500, 500, "cover"),
      );
      next();
    } catch {
      next(
        new AppError("Could not process that image. Try another file.", 400),
      );
    }
  },
);

export const resizeProductImage = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.file) return next();

    try {
      applyJpegBuffer(
        req,
        await resizeToJpeg(req.file.buffer, 1200, 1200, "inside"),
      );
      next();
    } catch {
      next(
        new AppError("Could not process that image. Try another file.", 400),
      );
    }
  },
);

export async function compressImageBuffer(
  buffer: Buffer,
  width: number,
  height: number,
  fit: keyof FitEnum = "inside",
) {
  return resizeToJpeg(buffer, width, height, fit);
}

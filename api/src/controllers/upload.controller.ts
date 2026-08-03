import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type { Request, Response, NextFunction } from "express";

import { getS3Client, getS3Config } from "../config/s3.js";
import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

type ImageKind = "avatar" | "cover";

async function uploadProfileImage(
  req: Request,
  res: Response,
  next: NextFunction,
  kind: ImageKind,
) {
  if (!req.file) {
    return next(new AppError("Please choose an image file to upload.", 400));
  }

  const ext = EXT_BY_MIME[req.file.mimetype];
  if (!ext) {
    return next(new AppError("Unsupported image type.", 400));
  }

  let bucket: string;
  let publicUrl: string;
  let s3;

  try {
    ({ bucket, publicUrl } = getS3Config());
    s3 = getS3Client();
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "S3 is not configured on the server.";
    return next(new AppError(message, 500));
  }

  const folder = kind === "avatar" ? "avatars" : "covers";
  const key = `${folder}/${req.user._id}/${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }),
  );

  const url = `${publicUrl}/${key}`;
  const field = kind === "avatar" ? "avatarUrl" : "coverUrl";

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { [field]: url },
    { new: true, runValidators: true },
  ).populate("theme");

  if (!profile) {
    return next(new AppError("No profile found for this user.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      profile,
      [field]: url,
    },
  });
}

/** POST /api/v1/profiles/me/avatar — multipart field "avatar" */
export const uploadMyAvatar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await uploadProfileImage(req, res, next, "avatar");
  },
);

/** POST /api/v1/profiles/me/cover — multipart field "cover" */
export const uploadMyCover = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await uploadProfileImage(req, res, next, "cover");
  },
);

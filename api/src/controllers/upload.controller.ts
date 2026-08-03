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

/**
 * POST /api/v1/profiles/me/avatar
 * multipart field name: "avatar"
 * Uploads to S3, then sets profile.avatarUrl to the public URL.
 */
export const uploadMyAvatar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const key = `avatars/${req.user._id}/${randomUUID()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        // Public-read if the bucket policy allows; R2 often uses public bucket / CDN instead
        // ACL: "public-read", // enable only if your provider supports ACLs
      }),
    );

    const avatarUrl = `${publicUrl}/${key}`;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { avatarUrl },
      { new: true, runValidators: true },
    ).populate("theme");

    if (!profile) {
      return next(new AppError("No profile found for this user.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        profile,
        avatarUrl,
      },
    });
  },
);

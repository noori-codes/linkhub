import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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

/** Only delete objects we serve from this bucket (never arbitrary URLs). */
function keyFromOurPublicUrl(
  url: string | undefined,
  publicUrl: string,
): string | null {
  if (!url) return null;
  const prefix = `${publicUrl}/`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(prefix.length);
  return key || null;
}

function isOwnedUploadKey(
  key: string,
  userId: string,
  kind: ImageKind,
): boolean {
  const folder = kind === "avatar" ? "avatars" : "covers";
  return key.startsWith(`${folder}/${userId}/`);
}

async function deleteOldObjectIfOurs(
  oldUrl: string | undefined,
  userId: string,
  kind: ImageKind,
  bucket: string,
  publicUrl: string,
  s3: ReturnType<typeof getS3Client>,
) {
  const key = keyFromOurPublicUrl(oldUrl, publicUrl);
  if (!key || !isOwnedUploadKey(key, userId, kind)) return;

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (err) {
    // Upload already succeeded — don't fail the request over cleanup
    console.warn("Could not delete old S3 object:", key, err);
  }
}

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

  const existing = await Profile.findOne({ user: req.user._id });
  if (!existing) {
    return next(new AppError("No profile found for this user.", 404));
  }

  const field = kind === "avatar" ? "avatarUrl" : "coverUrl";
  const oldUrl = existing[field];

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

  const profile = await Profile.findOneAndUpdate(
    { user: req.user._id },
    { [field]: url },
    { new: true, runValidators: true },
  ).populate("theme");

  if (!profile) {
    return next(new AppError("No profile found for this user.", 404));
  }

  // Best-effort: free the previous MinIO/S3 object if it was ours
  await deleteOldObjectIfOurs(
    oldUrl,
    req.user._id.toString(),
    kind,
    bucket,
    publicUrl,
    s3,
  );

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

import multer from "multer";

import AppError from "../utils/appError.js";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Memory storage — buffer goes straight to S3 (no disk write). */
export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED.has(file.mimetype)) {
      cb(
        new AppError(
          "Avatar must be a JPEG, PNG, WebP, or GIF image.",
          400,
        ) as unknown as Error,
      );
      return;
    }
    cb(null, true);
  },
});

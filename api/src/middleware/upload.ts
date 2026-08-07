import multer from "multer";

import AppError from "../utils/appError.js";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function imageUpload(options: {
  maxBytes: number;
  label: string;
}) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: options.maxBytes },
    fileFilter(_req, file, cb) {
      if (!ALLOWED.has(file.mimetype)) {
        cb(
          new AppError(
            `${options.label} must be a JPEG, PNG, WebP, or GIF image.`,
            400,
          ) as unknown as Error,
        );
        return;
      }
      cb(null, true);
    },
  });
}

export const avatarUpload = imageUpload({
  maxBytes: 2 * 1024 * 1024,
  label: "Avatar",
});

export const coverUpload = imageUpload({
  maxBytes: 5 * 1024 * 1024,
  label: "Cover",
});

export const productUpload = imageUpload({
  maxBytes: 5 * 1024 * 1024,
  label: "Product image",
});

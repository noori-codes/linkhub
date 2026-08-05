import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

import { getS3Client, getS3Config } from "../config/s3.js";
import Product from "../models/product.model.js";
import ProductLink from "../models/productLink.model.js";
import Profile from "../models/profile.model.js";
import {
  downloadRemoteImage,
  fetchLinkPreview,
} from "../utils/linkPreview.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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

function isOwnedProductUploadKey(key: string, userId: string): boolean {
  return key.startsWith(`products/${userId}/`);
}

// Products belong to a Profile (same ownership pattern as Links).
const getMyProfileOrFail = async (userId: string) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new AppError("Create a profile before managing products.", 404);
  }

  return profile;
};

// =============================
// GET ALL PRODUCTS
// =============================

export const getAllProducts = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("profile", "username displayName status");

    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  },
);

// =============================
// CREATE PRODUCT
// =============================

export const createProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());

    let order = req.body.order;
    if (order === undefined) {
      const lastProduct = await Product.findOne({ profile: profile._id })
        .sort({ order: -1 })
        .select("order");

      order = lastProduct ? lastProduct.order + 1 : 0;
    }

    const product = await Product.create({
      profile: profile._id,
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      order,
      isVisible: req.body.isVisible,
    });

    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  },
);

// =============================
// GET MY PRODUCTS (owner)
// =============================

export const getMyProducts = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());

    const products = await Product.find({ profile: profile._id })
      .sort({
        order: 1,
      })
      .lean();

    const productIds = products.map((product) => product._id);
    const linkCounts =
      productIds.length > 0
        ? await ProductLink.aggregate<{ _id: Types.ObjectId; count: number }>([
            {
              $match: {
                product: { $in: productIds },
                isVisible: true,
              },
            },
            { $group: { _id: "$product", count: { $sum: 1 } } },
          ])
        : [];

    const countByProduct = new Map(
      linkCounts.map((row) => [String(row._id), row.count]),
    );

    const productsWithCounts = products.map((product) => ({
      ...product,
      linkCount: countByProduct.get(String(product._id)) ?? 0,
    }));

    res.status(200).json({
      status: "success",
      results: productsWithCounts.length,
      data: {
        products: productsWithCounts,
      },
    });
  },
);

// =============================
// GET PUBLIC PRODUCTS BY USERNAME
// Visitors on /u/:username use this
// =============================

export const getPublicProductsByUsername = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;

    if (!username) {
      return next(new AppError("Please provide a username.", 400));
    }

    const profile = await Profile.findOne({
      username: username.toString().toLowerCase(),
      status: "published",
    }).select("_id");

    if (!profile) {
      return next(
        new AppError("No published profile found with that username.", 404),
      );
    }

    const products = await Product.find({
      profile: profile._id,
      isVisible: true,
    })
      .sort({ order: 1 })
      .lean();

    const productIds = products.map((product) => product._id);
    const rawLinks =
      productIds.length > 0
        ? await ProductLink.find({
            product: { $in: productIds },
            isVisible: true,
          })
            .sort({ order: 1 })
            .lean()
        : [];

    const linksByProduct = new Map<string, typeof rawLinks>();
    for (const productLink of rawLinks) {
      const key = String(productLink.product);
      const current = linksByProduct.get(key) ?? [];
      current.push(productLink);
      linksByProduct.set(key, current);
    }

    // Only publish products that have at least one buy link — empty cards look broken
    const publicProducts = products
      .map((product) => ({
        ...product,
        links: linksByProduct.get(String(product._id)) ?? [],
      }))
      .filter((product) => product.links.length > 0);

    res.status(200).json({
      status: "success",
      results: publicProducts.length,
      data: {
        products: publicProducts,
      },
    });
  },
);

// =============================
// UPLOAD PRODUCT IMAGE
// =============================

export const uploadProductImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError("Please choose an image file to upload.", 400));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("Please provide a product id.", 400));
    }

    const ext = EXT_BY_MIME[req.file.mimetype];
    if (!ext) {
      return next(new AppError("Unsupported image type.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());
    const product = await Product.findOne({ _id: id, profile: profile._id });

    if (!product) {
      return next(new AppError("No product found with that ID.", 404));
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

    const userId = req.user._id.toString();
    const oldUrl = product.imageUrl;
    const key = `products/${userId}/${product._id}/${randomUUID()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }),
    );

    const url = `${publicUrl}/${key}`;

    const updated = await Product.findByIdAndUpdate(
      product._id,
      { imageUrl: url },
      { new: true, runValidators: true },
    );

    const oldKey = keyFromOurPublicUrl(oldUrl, publicUrl);
    if (oldKey && isOwnedProductUploadKey(oldKey, userId)) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: oldKey,
          }),
        );
      } catch (err) {
        console.warn("Could not delete old product image:", oldKey, err);
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        product: updated,
        imageUrl: url,
      },
    });
  },
);

// =============================
// LINK PREVIEW (og:image etc.)
// =============================

export const previewProductLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const url =
      typeof req.body.url === "string" ? req.body.url.trim() : "";

    if (!url) {
      return next(new AppError("Please provide a product URL.", 400));
    }

    try {
      const preview = await fetchLinkPreview(url);
      res.status(200).json({
        status: "success",
        data: { preview },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not preview that link.";
      return next(new AppError(message, 400));
    }
  },
);

// =============================
// SET PRODUCT IMAGE FROM REMOTE URL
// Downloads og/product image into MinIO
// =============================

export const uploadProductImageFromUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const imageUrl =
      typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";

    if (!id) {
      return next(new AppError("Please provide a product id.", 400));
    }
    if (!imageUrl) {
      return next(new AppError("Please provide an image URL.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());
    const product = await Product.findOne({ _id: id, profile: profile._id });

    if (!product) {
      return next(new AppError("No product found with that ID.", 404));
    }

    let downloaded;
    try {
      downloaded = await downloadRemoteImage(imageUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not download that image.";
      return next(new AppError(message, 400));
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

    const userId = req.user._id.toString();
    const oldUrl = product.imageUrl;
    const key = `products/${userId}/${product._id}/${randomUUID()}.${downloaded.ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: downloaded.buffer,
        ContentType: downloaded.contentType,
      }),
    );

    const url = `${publicUrl}/${key}`;

    const updated = await Product.findByIdAndUpdate(
      product._id,
      { imageUrl: url },
      { new: true, runValidators: true },
    );

    const oldKey = keyFromOurPublicUrl(oldUrl, publicUrl);
    if (oldKey && isOwnedProductUploadKey(oldKey, userId)) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: oldKey,
          }),
        );
      } catch (err) {
        console.warn("Could not delete old product image:", oldKey, err);
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        product: updated,
        imageUrl: url,
      },
    });
  },
);

// =============================
// UPDATE PRODUCT
// =============================

export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a product id.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());

    const allowedFields = [
      "title",
      "description",
      "imageUrl",
      "order",
      "isVisible",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, profile: profile._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return next(new AppError("No product found with that ID.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  },
);

// =============================
// DELETE PRODUCT
// Also removes buy/affiliate ProductLinks under it
// =============================

export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a product id.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());

    const product = await Product.findOneAndDelete({
      _id: id,
      profile: profile._id,
    });

    if (!product) {
      return next(new AppError("No product found with that ID.", 404));
    }

    await ProductLink.deleteMany({ product: product._id });

    res.status(204).send();
  },
);

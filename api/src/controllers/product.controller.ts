import type { Request, Response, NextFunction } from "express";

import Product from "../models/product.model.js";
import ProductLink from "../models/productLink.model.js";
import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

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

    const products = await Product.find({ profile: profile._id }).sort({
      order: 1,
    });

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

    const publicProducts = products.map((product) => ({
      ...product,
      links: linksByProduct.get(String(product._id)) ?? [],
    }));

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

import type { Request, Response, NextFunction } from "express";

import Product from "../models/product.model.js";
import ProductLink from "../models/productLink.model.js";
import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const getMyProfileOrFail = async (userId: string) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new AppError("Create a profile before managing product links.", 404);
  }

  return profile;
};

/** Product must exist AND belong to the logged-in user's profile. */
const getMyProductOrFail = async (userId: string, productId: string) => {
  const profile = await getMyProfileOrFail(userId);

  const product = await Product.findOne({
    _id: productId,
    profile: profile._id,
  });

  if (!product) {
    throw new AppError("No product found with that ID.", 404);
  }

  return product;
};

// =============================
// CREATE PRODUCT LINK
// POST /products/:productId/links
// =============================

export const createProductLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId?.toString();

    if (!productId) {
      return next(new AppError("Please provide a product id.", 400));
    }

    const product = await getMyProductOrFail(
      req.user._id.toString(),
      productId,
    );

    let order = req.body.order;
    if (order === undefined) {
      const lastLink = await ProductLink.findOne({ product: product._id })
        .sort({ order: -1 })
        .select("order");

      order = lastLink ? lastLink.order + 1 : 0;
    }

    const productLink = await ProductLink.create({
      product: product._id,
      title: req.body.title,
      url: req.body.url,
      isAffiliate: req.body.isAffiliate,
      order,
      isVisible: req.body.isVisible,
    });

    res.status(201).json({
      status: "success",
      data: {
        productLink,
      },
    });
  },
);

// =============================
// GET LINKS FOR ONE PRODUCT (owner)
// GET /products/:productId/links
// =============================

export const getProductLinks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId?.toString();

    if (!productId) {
      return next(new AppError("Please provide a product id.", 400));
    }

    const product = await getMyProductOrFail(
      req.user._id.toString(),
      productId,
    );

    const productLinks = await ProductLink.find({ product: product._id }).sort({
      order: 1,
    });

    res.status(200).json({
      status: "success",
      results: productLinks.length,
      data: {
        productLinks,
      },
    });
  },
);

// =============================
// UPDATE PRODUCT LINK
// PATCH /products/:productId/links/:linkId
// =============================

export const updateProductLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId?.toString();
    const linkId = req.params.linkId?.toString();

    if (!productId || !linkId) {
      return next(new AppError("Please provide product id and link id.", 400));
    }

    const product = await getMyProductOrFail(
      req.user._id.toString(),
      productId,
    );

    const allowedFields = [
      "title",
      "url",
      "isAffiliate",
      "order",
      "isVisible",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const productLink = await ProductLink.findOneAndUpdate(
      { _id: linkId, product: product._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!productLink) {
      return next(new AppError("No product link found with that ID.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        productLink,
      },
    });
  },
);

// =============================
// DELETE PRODUCT LINK
// DELETE /products/:productId/links/:linkId
// =============================

export const deleteProductLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId?.toString();
    const linkId = req.params.linkId?.toString();

    if (!productId || !linkId) {
      return next(new AppError("Please provide product id and link id.", 400));
    }

    const product = await getMyProductOrFail(
      req.user._id.toString(),
      productId,
    );

    const productLink = await ProductLink.findOneAndDelete({
      _id: linkId,
      product: product._id,
    });

    if (!productLink) {
      return next(new AppError("No product link found with that ID.", 404));
    }

    res.status(204).send();
  },
);

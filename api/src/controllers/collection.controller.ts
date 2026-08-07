import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

import Collection from "../models/collection.model.js";
import Product from "../models/product.model.js";
import Profile from "../models/profile.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const getMyProfileOrFail = async (userId: string) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new AppError("Create a profile before managing collections.", 404);
  }

  return profile;
};

/** Ensure every product id belongs to this profile; return deduped ids. */
async function assertOwnedProductIds(
  profileId: Types.ObjectId,
  productIds: unknown,
): Promise<string[]> {
  if (!Array.isArray(productIds)) {
    throw new AppError("Products must be an array of ids.", 400);
  }

  const ids = [
    ...new Set(
      productIds
        .filter((id): id is string => typeof id === "string" && id.length > 0)
        .map((id) => id),
    ),
  ];

  if (ids.length === 0) {
    return [];
  }

  const count = await Product.countDocuments({
    _id: { $in: ids },
    profile: profileId,
  });

  if (count !== ids.length) {
    throw new AppError(
      "One or more products do not belong to your profile.",
      400,
    );
  }

  return ids;
}

// =============================
// GET MY COLLECTIONS (owner)
// =============================

export const getMyCollections = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());

    const collections = await Collection.find({ profile: profile._id })
      .sort({ order: 1 })
      .populate("products", "title imageUrl isVisible order")
      .lean();

    res.status(200).json({
      status: "success",
      results: collections.length,
      data: {
        collections,
      },
    });
  },
);

// =============================
// CREATE COLLECTION
// =============================

export const createCollection = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());

    if (!req.body.title || typeof req.body.title !== "string") {
      throw new AppError("Please provide a collection title.", 400);
    }

    let order = req.body.order;
    if (order === undefined) {
      const last = await Collection.findOne({ profile: profile._id })
        .sort({ order: -1 })
        .select("order");
      order = last ? last.order + 1 : 0;
    }

    const productIds =
      req.body.products !== undefined
        ? await assertOwnedProductIds(profile._id, req.body.products)
        : [];

    const collection = await Collection.create({
      profile: profile._id,
      title: req.body.title,
      description: req.body.description,
      products: productIds,
      order,
      isVisible: req.body.isVisible,
    });

    const populated = await Collection.findById(collection._id)
      .populate("products", "title imageUrl isVisible order")
      .lean();

    res.status(201).json({
      status: "success",
      data: {
        collection: populated,
      },
    });
  },
);

// =============================
// UPDATE COLLECTION
// =============================

export const updateCollection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a collection id.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());

    const allowedFields = [
      "title",
      "description",
      "order",
      "isVisible",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.body.products !== undefined) {
      updates.products = await assertOwnedProductIds(
        profile._id,
        req.body.products,
      );
    }

    const collection = await Collection.findOneAndUpdate(
      { _id: id, profile: profile._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("products", "title imageUrl isVisible order")
      .lean();

    if (!collection) {
      return next(new AppError("No collection found with that ID.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        collection,
      },
    });
  },
);

// =============================
// DELETE COLLECTION
// Products are left intact — only the grouping is removed
// =============================

export const deleteCollection = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a collection id.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());

    const collection = await Collection.findOneAndDelete({
      _id: id,
      profile: profile._id,
    });

    if (!collection) {
      return next(new AppError("No collection found with that ID.", 404));
    }

    res.status(204).send();
  },
);

// =============================
// GET PUBLIC COLLECTIONS BY USERNAME
// Visible groupings for /u/:username shop
// =============================

export const getPublicCollectionsByUsername = catchAsync(
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

    const collections = await Collection.find({
      profile: profile._id,
      isVisible: true,
    })
      .sort({ order: 1 })
      .select("title description order products")
      .lean();

    res.status(200).json({
      status: "success",
      results: collections.length,
      data: {
        collections: collections.map((collection) => ({
          _id: collection._id,
          title: collection.title,
          description: collection.description,
          order: collection.order,
          products: (collection.products ?? []).map((id) => String(id)),
        })),
      },
    });
  },
);

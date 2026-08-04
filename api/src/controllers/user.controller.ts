import type { Request, Response, NextFunction } from "express";

import AnalyticsEvent from "../models/analyticsEvent.model.js";
import Collection from "../models/collection.model.js";
import Link from "../models/link.model.js";
import Product from "../models/product.model.js";
import ProductLink from "../models/productLink.model.js";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// =============================
// GET CURRENT USER (GET /users/me)
// Safe shape only — no password, no verify/reset tokens
// =============================

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Explicit fields so emailVerified is ready for the dashboard later
  res.status(200).json({
    status: "success",
    data: {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        photo: user.photo,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
      },
    },
  });
});

// =============================
// GET ALL USERS
// Safe fields only — never return password / tokens
// =============================

export const getAllUsers = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await User.find()
      .select(
        "firstName lastName email emailVerified photo onboardingCompleted onboardingStep createdAt",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  },
);

// =============================
// UPDATE CURRENT USER
// =============================

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Whitelist — never accept password here (use updateMyPassword)
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "onboardingStep",
      "onboardingCompleted",
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError("No valid fields to update.", 400));
    }

    // Completing the wizard should flip both flags together
    if (updates.onboardingCompleted === true) {
      updates.onboardingStep = "done";
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          emailVerified: user.emailVerified,
          photo: user.photo,
          onboardingCompleted: user.onboardingCompleted,
          onboardingStep: user.onboardingStep,
        },
      },
    });
  },
);

// =============================
// DELETE CURRENT USER
// Hard delete — frees email + username for reuse
// =============================

export const deleteMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const profile = await Profile.findOne({ user: userId });

    if (profile) {
      const profileId = profile._id;

      // Profile-owned rows first (username unique index lives on Profile)
      await Promise.all([
        Link.deleteMany({ profile: profileId }),
        AnalyticsEvent.deleteMany({ profile: profileId }),
        Collection.deleteMany({ profile: profileId }),
      ]);

      const products = await Product.find({ profile: profileId }).select("_id");
      const productIds = products.map((p) => p._id);
      if (productIds.length > 0) {
        await ProductLink.deleteMany({ product: { $in: productIds } });
        await Product.deleteMany({ profile: profileId });
      }

      await Profile.findByIdAndDelete(profileId);
    }

    await User.findByIdAndDelete(userId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

import type { Request, Response, NextFunction } from "express";

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
// =============================

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user._id, {
      active: false,
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

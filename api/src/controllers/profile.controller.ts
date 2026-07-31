import type { Request, Response, NextFunction } from "express";

import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// =============================
// CREATE MY PROFILE
// =============================

export const createProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const existing = await Profile.findOne({ user: req.user._id });

    if (existing) {
      return next(new AppError("You already have a profile.", 400));
    }

    const profile = await Profile.create({
      user: req.user._id,
      username: req.body.username,
      displayName:
        req.body.displayName ||
        `${req.user.firstName} ${req.user.lastName}`.trim(),
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
      location: req.body.location,
      website: req.body.website,
      tags: req.body.tags,
      theme: req.body.theme,
    });

    res.status(201).json({
      status: "success",
      data: {
        profile,
      },
    });
  },
);

// =============================
// GET MY PROFILE
// =============================

export const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      "theme",
    );

    if (!profile) {
      return next(new AppError("You do not have a profile yet.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        profile,
      },
    });
  },
);

// =============================
// UPDATE MY PROFILE
// =============================

export const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allowedFields = [
      "username",
      "displayName",
      "bio",
      "avatarUrl",
      "location",
      "website",
      "status",
      "tags",
      "theme",
      "emailSignatureHtml",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    ).populate("theme");

    if (!profile) {
      return next(new AppError("You do not have a profile yet.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        profile,
      },
    });
  },
);

// =============================
// GET PUBLIC PROFILE BY USERNAME
// =============================

export const getProfileByUsername = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.username) {
      return next(new AppError("Please provide a username.", 400));
    }

    const profile = await Profile.findOne({
      username: req.params.username?.toString().toLowerCase(),
      status: "published",
    }).populate("theme");

    if (!profile) {
      return next(
        new AppError("No published profile found with that username.", 404),
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        profile,
      },
    });
  },
);

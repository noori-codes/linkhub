import type { Request, Response, NextFunction } from "express";

import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// =============================
// CREATE MY PROFILE
// One public page per user (User 1 → 1 Profile)
// =============================

export const createProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Enforce 1 profile per account
    const existing = await Profile.findOne({ user: req.user._id });

    if (existing) {
      return next(new AppError("You already have a profile.", 400));
    }

    const profile = await Profile.create({
      user: req.user._id, // owner from JWT — never take user id from the body
      username: req.body.username, // becomes the public URL /u/:username
      // Fallback display name from account first/last name
      displayName:
        req.body.displayName ||
        `${req.user.firstName} ${req.user.lastName}`.trim(),
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl,
      location: req.body.location,
      website: req.body.website,
      tags: req.body.tags,
      theme: req.body.theme,
      // status defaults to "draft" in the schema (not public yet)
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
// GET MY PROFILE (owner / dashboard)
// Includes draft profiles
// =============================

export const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // populate("theme") replaces theme ObjectId with the full Theme document
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
// Also used to publish: { "status": "published" }
// =============================

export const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Whitelist so clients can't overwrite user, _id, createdAt, etc.
    const allowedFields = [
      "username",
      "displayName",
      "bio",
      "avatarUrl",
      "coverUrl",
      "location",
      "website",
      "status", // draft | published
      "tags",
      "theme",
      "emailSignatureHtml",
    ] as const;

    const updates: Record<string, unknown> = {};

    // Partial update: only apply fields that were sent
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Scope by user so you can only update YOUR profile
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
// Visitors use this — drafts are NOT returned
// =============================

export const getProfileByUsername = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TypeScript: req.params.username may be undefined — check first
    if (!req.params.username) {
      return next(new AppError("Please provide a username.", 400));
    }

    // Both username AND published status must match
    const profile = await Profile.findOne({
      username: req.params.username.toString().toLowerCase(),
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

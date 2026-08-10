import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import Profile from "../models/profile.model.js";
import Theme from "../models/theme.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { findDefaultTheme } from "../utils/findDefaultTheme.js";
import {
  canonicalizeOurObjectUrl,
  signedProfileJson,
} from "../utils/s3SignedUrl.js";


// =============================
// CREATE MY PROFILE
// =============================

export const createProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const existing = await Profile.findOne({ user: req.user._id });

    if (existing) {
      return next(new AppError("You already have a profile.", 400));
    }

    let themeId = req.body.theme;
    if (themeId) {
      if (!mongoose.isValidObjectId(themeId)) {
        return next(new AppError("Invalid theme id.", 400));
      }
      const themeExists = await Theme.exists({ _id: themeId });
      if (!themeExists) {
        return next(new AppError("Theme not found.", 404));
      }
    } else {
      const defaultTheme = await findDefaultTheme();
      themeId = defaultTheme?._id;
    }

    const profile = await Profile.create({
      user: req.user._id, // owner from JWT — never take user id from the body
      username: req.body.username,
      displayName:
        req.body.displayName ||
        `${req.user.firstName} ${req.user.lastName}`.trim(),
      bio: req.body.bio,
      avatarUrl: canonicalizeOurObjectUrl(req.body.avatarUrl) ?? req.body.avatarUrl,
      location: req.body.location,
      website: req.body.website,
      tags: req.body.tags,
      theme: themeId,
    });

    res.status(201).json({
      status: "success",
      data: {
        profile: await signedProfileJson(profile),
      },
    });
  },
);


// =============================
// GET MY PROFILE (owner / dashboard)
// =============================

export const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let profile = await Profile.findOne({ user: req.user._id }).populate(
      "theme",
    );

    if (!profile) {
      return next(new AppError("You do not have a profile yet.", 404));
    }

    // Backfill Classic theme for older profiles
    if (!profile.theme) {
      const defaultTheme = await findDefaultTheme();
      if (defaultTheme) {
        profile.theme = defaultTheme._id;
        await profile.save();
        profile = await Profile.findById(profile._id).populate("theme");
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        profile: await signedProfileJson(profile),
      },
    });
  },
);


// =============================
// UPDATE MY PROFILE
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
      "buttonShape",
      "emailSignatureHtml",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Never persist expired signed query strings — store the stable object URL
    if (typeof updates.avatarUrl === "string") {
      updates.avatarUrl = canonicalizeOurObjectUrl(updates.avatarUrl);
    }
    if (typeof updates.coverUrl === "string") {
      updates.coverUrl = canonicalizeOurObjectUrl(updates.coverUrl);
    }

    if (updates.buttonShape !== undefined) {
      const shape = updates.buttonShape;
      if (
        typeof shape !== "string" ||
        !["square", "rounded", "pill"].includes(shape)
      ) {
        return next(
          new AppError("buttonShape must be square, rounded, or pill.", 400),
        );
      }
    }

    if (updates.theme !== undefined) {
      const themeId = updates.theme;
      if (typeof themeId !== "string" || !mongoose.isValidObjectId(themeId)) {
        return next(new AppError("Invalid theme id.", 400));
      }
      const themeExists = await Theme.exists({ _id: themeId });
      if (!themeExists) {
        return next(new AppError("Theme not found.", 404));
      }
    }

    // Soft verify with a real limit: must confirm email before going live
    if (updates.status === "published" && !req.user.emailVerified) {
      return next(
        new AppError(
          "First confirm your email before you can publish.",
          403,
        ),
      );
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
        profile: await signedProfileJson(profile),
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
        profile: await signedProfileJson(profile),
      },
    });
  },
);

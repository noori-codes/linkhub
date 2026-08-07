import type { Request, Response, NextFunction } from "express";

import AnalyticsEvent from "../models/analyticsEvent.model.js";
import Link from "../models/link.model.js";
import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Links belong to a Profile, NOT directly to a User.
// So before any link action, we resolve: User (from JWT) → Profile.
const getMyProfileOrFail = async (userId: string) => {
  const profile = await Profile.findOne({ user: userId });

  if (!profile) {
    throw new AppError("Create a profile before managing links.", 404);
  }

  return profile;
};

// =============================
// CREATE LINK
// =============================

export const createLink = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());

    let order = req.body.order;
    if (order === undefined) {
      const lastLink = await Link.findOne({ profile: profile._id })
        .sort({ order: -1 })
        .select("order");

      order = lastLink ? lastLink.order + 1 : 0;
    }

    const link = await Link.create({
      profile: profile._id, // always set from auth — never trust a client-sent profile id
      title: req.body.title,
      url: req.body.url,
      type: req.body.type,
      platform: req.body.platform,
      order,
      isVisible: req.body.isVisible,
    });

    res.status(201).json({
      status: "success",
      data: {
        link,
      },
    });
  },
);

// =============================
// GET MY LINKS (owner / dashboard)
// =============================

export const getMyLinks = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());

    const links = await Link.find({ profile: profile._id }).sort({ order: 1 });

    res.status(200).json({
      status: "success",
      results: links.length,
      data: {
        links,
      },
    });
  },
);

// =============================
// UPDATE LINK (title, url, visibility, etc.)
// =============================

export const updateLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a link id.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());

    // Whitelist: ignore unexpected body fields (e.g. clickCount, profile, _id)
    const allowedFields = [
      "title",
      "url",
      "type",
      "platform",
      "order",
      "isVisible",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Filtering by both _id AND profile prevents editing someone else's link
    const link = await Link.findOneAndUpdate(
      { _id: id, profile: profile._id },
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!link) {
      return next(new AppError("No link found with that ID.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        link,
      },
    });
  },
);

// =============================
// DELETE LINK
// =============================

export const deleteLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a link id.", 400));
    }

    const profile = await getMyProfileOrFail(req.user._id.toString());

    const link = await Link.findOneAndDelete({
      _id: id,
      profile: profile._id,
    });

    if (!link) {
      return next(new AppError("No link found with that ID.", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// =============================
// REORDER LINKS
// =============================

export const reorderLinks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await getMyProfileOrFail(req.user._id.toString());
    const items = req.body.links;

    if (!Array.isArray(items) || items.length === 0) {
      return next(
        new AppError("Please provide links: [{ id, order }, ...].", 400),
      );
    }

    await Promise.all(
      items.map((item: { id: string; order: number }) =>
        Link.findOneAndUpdate(
          { _id: item.id, profile: profile._id },
          { order: item.order },
          { runValidators: true },
        ),
      ),
    );

    const links = await Link.find({ profile: profile._id }).sort({ order: 1 });

    res.status(200).json({
      status: "success",
      results: links.length,
      data: {
        links,
      },
    });
  },
);

// =============================
// GET PUBLIC LINKS BY USERNAME
// =============================

export const getPublicLinksByUsername = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;

    if (!username) {
      return next(new AppError("Please provide a username.", 400));
    }

    // Draft profiles stay private — only published ones are public
    const profile = await Profile.findOne({
      username: username.toString().toLowerCase(),
      status: "published",
    });

    if (!profile) {
      return next(
        new AppError("No published profile found with that username.", 404),
      );
    }

    const links = await Link.find({
      profile: profile._id,
      isVisible: true,
    }).sort({ order: 1 });

    res.status(200).json({
      status: "success",
      results: links.length,
      data: {
        links,
      },
    });
  },
);

// =============================
// TRACK + REDIRECT PUBLIC LINK
// =============================

export const redirectPublicLink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("Please provide a link id.", 400));
    }

    const link = await Link.findById(id);

    if (!link || !link.isVisible) {
      return next(new AppError("No public link found with that ID.", 404));
    }

    const profile = await Profile.findOne({
      _id: link.profile,
      status: "published",
    }).select("_id");

    if (!profile) {
      return next(new AppError("No public link found with that ID.", 404));
    }

    await Promise.all([
      Link.findByIdAndUpdate(link._id, { $inc: { clickCount: 1 } }),
      AnalyticsEvent.create({
        profile: profile._id,
        type: "link_click",
        link: link._id,
        meta: {
          referrer: req.get("referer") || "",
          userAgent: req.get("user-agent") || "",
        },
      }),
    ]);

    return res.redirect(302, link.url);
  },
);

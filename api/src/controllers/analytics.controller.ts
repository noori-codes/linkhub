import type { Request, Response, NextFunction } from "express";

import AnalyticsEvent from "../models/analyticsEvent.model.js";
import Link from "../models/link.model.js";
import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// =============================
// RECORD PUBLIC PROFILE VIEW
// =============================

export const recordProfileView = catchAsync(
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

    await AnalyticsEvent.create({
      profile: profile._id,
      type: "profile_view",
      meta: {
        referrer: req.get("referer") || "",
        userAgent: req.get("user-agent") || "",
      },
    });

    res.status(204).send();
  },
);

// =============================
// RECORD PUBLIC PROFILE SHARE
// =============================

export const recordProfileShare = catchAsync(
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

    const method =
      typeof req.body?.method === "string" ? req.body.method.slice(0, 40) : "";

    await AnalyticsEvent.create({
      profile: profile._id,
      type: "share",
      meta: {
        referrer: method || req.get("referer") || "",
        userAgent: req.get("user-agent") || "",
      },
    });

    res.status(204).send();
  },
);

// =============================
// GET MY ANALYTICS (owner)
// =============================

export const getMyAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await Profile.findOne({ user: req.user._id }).select("_id");

    if (!profile) {
      return next(
        new AppError("Create a profile before viewing analytics.", 404),
      );
    }

    const [links, recentEvents, clickEventCount, profileViews, shares] =
      await Promise.all([
        Link.find({ profile: profile._id })
          .select("title url clickCount isVisible")
          .sort({ clickCount: -1, order: 1 }),
        AnalyticsEvent.find({
          profile: profile._id,
          type: "link_click",
        })
          .sort({ createdAt: -1 })
          .limit(15)
          .populate("link", "title url")
          .select("type link createdAt meta"),
        AnalyticsEvent.countDocuments({
          profile: profile._id,
          type: "link_click",
        }),
        AnalyticsEvent.countDocuments({
          profile: profile._id,
          type: "profile_view",
        }),
        AnalyticsEvent.countDocuments({
          profile: profile._id,
          type: "share",
        }),
      ]);

    const totalClicks = links.reduce(
      (sum, link) => sum + (link.clickCount || 0),
      0,
    );
    const topLinks = links
      .filter((link) => link.clickCount > 0)
      .slice(0, 5)
      .map((link) => ({
        _id: link._id,
        title: link.title,
        url: link.url,
        clickCount: link.clickCount,
        isVisible: link.isVisible,
      }));

    const recentClicks = recentEvents.map((event) => {
      const populated = event.link as
        | { _id: unknown; title?: string; url?: string }
        | null
        | undefined;

      return {
        _id: event._id,
        createdAt: event.get("createdAt") as Date | undefined,
        referrer: event.meta?.referrer || "",
        link: populated
          ? {
              _id: populated._id,
              title: populated.title || "Deleted link",
              url: populated.url || "",
            }
          : null,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          profileViews,
          totalClicks,
          shares,
          linkCount: links.length,
          eventCount: clickEventCount,
        },
        topLinks,
        recentClicks,
      },
    });
  },
);

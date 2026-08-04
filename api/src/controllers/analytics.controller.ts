import type { Request, Response, NextFunction } from "express";

import AnalyticsEvent from "../models/analyticsEvent.model.js";
import Link from "../models/link.model.js";
import Profile from "../models/profile.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// =============================
// GET MY ANALYTICS (owner)
// Totals + top links + recent clicks
// =============================

export const getMyAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await Profile.findOne({ user: req.user._id }).select("_id");

    if (!profile) {
      return next(new AppError("Create a profile before viewing analytics.", 404));
    }

    const [links, recentEvents, eventCount] = await Promise.all([
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
    ]);

    const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
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
          totalClicks,
          linkCount: links.length,
          eventCount,
        },
        topLinks,
        recentClicks,
      },
    });
  },
);

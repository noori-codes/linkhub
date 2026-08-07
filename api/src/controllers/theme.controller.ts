import type { Request, Response } from "express";

import Theme from "../models/theme.model.js";
import catchAsync from "../utils/catchAsync.js";

// =============================
// LIST THEMES
// Public — used by Design picker + onboarding later
// =============================

export const getAllThemes = catchAsync(async (_req: Request, res: Response) => {
  const themes = await Theme.find().sort({
    isDefault: -1,
    slug: 1,
    name: 1,
  });

  res.status(200).json({
    status: "success",
    results: themes.length,
    data: {
      themes,
    },
  });
});

import type { Request, Response, NextFunction } from "express";

import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// =============================
// GET CURRENT USER
// =============================

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req.user._id.toString();

  next();
};

// =============================
// GET USER
// =============================

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  },
);

// =============================
// UPDATE CURRENT USER
// =============================

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: "success",
      data: {
        user,
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

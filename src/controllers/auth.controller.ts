import type { Request, Response, NextFunction } from "express";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { config } from "../config/config.js";

// Create JWT token

const signToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

// Send JWT token to client
const createSendToken = (
  user: any,
  statusCode: number,
  req: Request,
  res: Response,
) => {
  const token = signToken(user._id.toString());

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Hide password from response
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// =============================
// SIGNUP
// =============================

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    createSendToken(newUser, 201, req, res);
  },
);

// =============================
// LOGIN
// =============================

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) Check email and password
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // 2) Find user
    const user = await User.findOne({
      email,
    }).select("+password");

    // 3) Check password
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 4) Send token
    createSendToken(user, 200, req, res);
  },
);

// =============================
// LOGOUT
// =============================

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get token
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    // 2) Verify token
    const decoded = (await promisify(jwt.verify)(
      token,
      config.jwtSecret,
    )) as JwtPayload;

    // 3) Find user
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401),
      );
    }

    // 4) Check if password changed
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401,
        ),
      );
    }

    // 5) Give access
    req.user = currentUser;

    next();
  },
);

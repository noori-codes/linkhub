import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import User, { type IUser } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { config } from "../config/config.js";
import crypto from "crypto";
import { promisify } from "node:util";

// Create JWT token

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

const signToken = (id: string): string => {
  const options: SignOptions = {};

  if (config.jwtExpiresIn) {
    options.expiresIn = config.jwtExpiresIn;
  }

  return jwt.sign({ id }, config.jwtSecret, options);
};

// Send JWT token to client
const createSendToken = (
  user: IUser,
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
  const userObj = user.toObject();
  delete userObj.password;

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
    const decoded = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
          reject(err);
        } else if (typeof decoded === "object" && decoded !== null) {
          resolve(decoded as JwtPayload);
        } else {
          reject(new Error("Invalid token"));
        }
      });
    });

    // 3) Find user
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401),
      );
    }

    // 4) Check if password changed
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return next(
    //     new AppError(
    //       "User recently changed password. Please log in again.",
    //       401,
    //     ),
    //   );
    // }

    // 5) Give access
    req.user = currentUser;

    next();
  },
);

// =============================
// FORGOT PASSWORD
// =============================

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user by email
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return next(
        new AppError("There is no user with this email address.", 404),
      );
    }

    // 2) Generate reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    // For now we just send token in response
    // Later you can replace this with email service

    res.status(200).json({
      status: "success",
      message: "Token generated successfully",
      resetToken,
    });
  },
);

// =============================
// RESET PASSWORD
// =============================

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Hash token from URL
    const token = req.params.token as string;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2) Find user with token and valid expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired.", 400));
    }

    // 3) Update password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 4) Login user automatically

    createSendToken(user, 200, req, res);
  },
);

// =============================
// UPDATE PASSWORD
// =============================

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get current user with password

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // 2) Check current password

    const isCorrect = await user.correctPassword(
      req.body.passwordCurrent,
      user.password,
    );

    if (!isCorrect) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    // 3) Update password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    // 4) Login again

    createSendToken(user, 200, req, res);
  },
);

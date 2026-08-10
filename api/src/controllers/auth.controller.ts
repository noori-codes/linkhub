import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import crypto from "node:crypto";

import User, { type IUser } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { config } from "../config/config.js";
import Email from "../config/email.js";

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


const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response,
  extras: Record<string, unknown> = {},
) => {
  const token = signToken(user._id.toString());

  // In development, keep cookie usable over plain http://localhost
  // (Bruno/browser won't store/send Secure cookies on HTTP)
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: isProduction
      ? req.secure || req.headers["x-forwarded-proto"] === "https"
      : false,
    sameSite: "lax",
  });

  const userObject = user.toObject() as Record<string, unknown>;
  delete userObject.password;
  delete userObject.passwordConfirm;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerifyToken;
  delete userObject.emailVerifyExpires;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: userObject,
    },
    ...extras,
  });
};


// =============================
// SIGNUP
// =============================

export const signup = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    });

    // Same pattern as password reset — store hashed token, email raw token
    const verifyToken = newUser.createEmailVerifyToken();
    await newUser.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL ?? "http://127.0.0.1:3001";
    const verifyURL = `${frontendUrl}/verify-email/${verifyToken}`;

    try {
      await new Email(newUser, verifyURL).sendEmailVerify();
    } catch {
      // Soft verify: signup still succeeds if email isn't configured
    }

    createSendToken(
      newUser,
      201,
      req,
      res,
      process.env.NODE_ENV === "development" ? { verifyURL } : {},
    );
  },
);


// =============================
// LOGIN
// =============================

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.toLowerCase().replace(/\s/g, "")
        : "";
    const { password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

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


// =============================
// PROTECT ROUTES
// =============================

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1) Prefer Authorization: Bearer <token> (Bruno / SPA / mobile)
    // Only use it when the token part is non-empty.
    // Otherwise Bruno sending "Bearer {{token}}" with empty {{token}}
    // would block the cookie fallback below.
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const headerToken = req.headers.authorization.split(" ")[1];
      if (headerToken && headerToken !== "{{token}}") {
        token = headerToken;
      }
    }

    if (!token && req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token || token === "loggedout") {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    const decoded = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token, config.jwtSecret, (err, decodedToken) => {
        if (err) {
          reject(err);
        } else if (typeof decodedToken === "object" && decodedToken !== null) {
          resolve(decodedToken as JwtPayload);
        } else {
          reject(new Error("Invalid token"));
        }
      });
    });

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401),
      );
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401,
        ),
      );
    }

    req.user = currentUser;

    next();
  },
);


// =============================
// FORGOT PASSWORD
// =============================

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.toLowerCase().replace(/\s/g, "")
        : "";

    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new AppError("There is no user with this email address.", 404),
      );
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({
      validateBeforeSave: false,
    });

    // Link must open the Next.js UI — not the PATCH API route
    const frontendUrl =
      process.env.FRONTEND_URL ?? "http://127.0.0.1:3001";
    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: "success",
        message: "Password reset token sent to email.",
        ...(process.env.NODE_ENV === "development" ? { resetURL } : {}),
      });
    } catch (err) {
      // Local learning: email often isn't configured — still return the link
      if (process.env.NODE_ENV === "development") {
        res.status(200).json({
          status: "success",
          message:
            "Email could not be sent (dev). Use the resetURL to continue.",
          resetURL,
        });
        return;
      }

      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({
        validateBeforeSave: false,
      });

      return next(
        new AppError(
          "There was an error sending the email. Try again later.",
          500,
        ),
      );
    }
  },
);


// =============================
// RESET PASSWORD
// =============================

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token as string;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired.", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, req, res);
  },
);


// =============================
// VERIFY EMAIL
// =============================

export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token as string;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or has expired.", 400));
    }

    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "Email verified.",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
    });
  },
);


// =============================
// RESEND VERIFY EMAIL
// =============================

export const resendVerifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    if (user.emailVerified) {
      return next(new AppError("Email is already verified.", 400));
    }

    const verifyToken = user.createEmailVerifyToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL ?? "http://127.0.0.1:3001";
    const verifyURL = `${frontendUrl}/verify-email/${verifyToken}`;

    try {
      await new Email(user, verifyURL).sendEmailVerify();

      res.status(200).json({
        status: "success",
        message: "Verification email sent.",
        ...(process.env.NODE_ENV === "development" ? { verifyURL } : {}),
      });
    } catch {
      // Local learning: email often isn't configured — still return the link
      if (process.env.NODE_ENV === "development") {
        res.status(200).json({
          status: "success",
          message:
            "Email could not be sent (dev). Use the verifyURL to continue.",
          verifyURL,
        });
        return;
      }

      user.emailVerifyToken = undefined;
      user.emailVerifyExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later.",
          500,
        ),
      );
    }
  },
);


// =============================
// UPDATE PASSWORD
// =============================

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401));
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    const isCorrect = await user.correctPassword(
      req.body.passwordCurrent,
      user.password,
    );

    if (!isCorrect) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, req, res);
  },
);

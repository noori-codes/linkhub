import mongoose, { Document, Model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export type OnboardingStep =
  | "profile"
  | "socials"
  | "theme"
  | "links"
  | "tags"
  | "done";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  emailVerifyToken: string | undefined;
  emailVerifyExpires: Date | undefined;
  password: string;
  photo: string;

  passwordConfirm: string | undefined;

  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  passwordChangedAt: Date | undefined;

  onboardingCompleted: boolean;
  onboardingStep: OnboardingStep;

  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;

  createPasswordResetToken(): string;
  createEmailVerifyToken(): string;

  changedPasswordAfter(JWTTimestamp: number): boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your first name."],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Please tell us your last name."],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide your email."],
      unique: true,
      lowercase: true,
      trim: true,
      set: (value: string) =>
        typeof value === "string"
          ? value.toLowerCase().replace(/\s/g, "")
          : value,
      validate: [validator.isEmail, "Please provide a valid email."],
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifyToken: {
      type: String,
    },

    emailVerifyExpires: {
      type: Date,
    },

    photo: {
      type: String,
      default: "default.jpg",
    },

    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: 8,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    onboardingStep: {
      type: String,
      enum: ["profile", "socials", "theme", "links", "tags", "done"],
      default: "profile",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

userSchema.methods.createEmailVerifyToken = function (): string {
  const verifyToken = crypto.randomBytes(32).toString("hex");

  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  this.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return verifyToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ProfileStatus = "draft" | "published";

export interface IProfile extends Document {
  user: Types.ObjectId;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  location: string;
  website: string;
  status: ProfileStatus;
  theme: Types.ObjectId | undefined;
  tags: string[];
  emailSignatureHtml: string;
}

const profileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Profile must belong to a user."],
      unique: true,
    },

    username: {
      type: String,
      required: [true, "Please choose a username."],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters."],
      maxlength: [30, "Username must be at most 30 characters."],
      match: [
        /^[a-z0-9._]+$/,
        "Username may only contain lowercase letters, numbers, dots, and underscores.",
      ],
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: [60, "Display name must be at most 60 characters."],
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [300, "Bio must be at most 300 characters."],
      default: "",
    },

    avatarUrl: {
      type: String,
      default: "default.jpg",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    theme: {
      type: Schema.Types.ObjectId,
      ref: "Theme",
    },

    tags: {
      type: [String],
      default: [],
    },

    emailSignatureHtml: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Profile: Model<IProfile> = mongoose.model<IProfile>(
  "Profile",
  profileSchema,
);

export default Profile;

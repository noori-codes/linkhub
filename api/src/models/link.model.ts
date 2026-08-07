import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type LinkType = "custom" | "social" | "alt_profile" | "product";

export interface ILink extends Document {
  profile: Types.ObjectId;
  title: string;
  url: string;
  type: LinkType;
  platform: string;
  order: number;
  isVisible: boolean;
  clickCount: number;
}

const linkSchema = new Schema<ILink>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Link must belong to a profile."],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Please provide a link title."],
      trim: true,
      maxlength: [100, "Title must be at most 100 characters."],
    },

    url: {
      type: String,
      required: [true, "Please provide a link URL."],
      trim: true,
    },

    type: {
      type: String,
      enum: ["custom", "social", "alt_profile", "product"],
      default: "custom",
    },

    platform: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

linkSchema.index({ profile: 1, order: 1 });

const Link: Model<ILink> = mongoose.model<ILink>("Link", linkSchema);

export default Link;

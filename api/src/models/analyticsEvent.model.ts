import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type AnalyticsEventType =
  | "profile_view"
  | "link_click"
  | "share"
  | "product_click";

export interface IAnalyticsEvent extends Document {
  profile: Types.ObjectId;
  type: AnalyticsEventType;
  link: Types.ObjectId | undefined;
  product: Types.ObjectId | undefined;
  meta: {
    referrer?: string;
    userAgent?: string;
  };
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Analytics event must belong to a profile."],
      index: true,
    },

    type: {
      type: String,
      enum: ["profile_view", "link_click", "share", "product_click"],
      required: [true, "Please provide an event type."],
    },

    link: {
      type: Schema.Types.ObjectId,
      ref: "Link",
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },

    meta: {
      referrer: {
        type: String,
        trim: true,
        default: "",
      },
      userAgent: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

analyticsEventSchema.index({ profile: 1, type: 1, createdAt: -1 });

const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;

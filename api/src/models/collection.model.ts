import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICollection extends Document {
  profile: Types.ObjectId;
  title: string;
  description: string;
  products: Types.ObjectId[];
  order: number;
  isVisible: boolean;
}

const collectionSchema = new Schema<ICollection>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Collection must belong to a profile."],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Please provide a collection title."],
      trim: true,
      maxlength: [120, "Title must be at most 120 characters."],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters."],
      default: "",
    },

    products: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
    },

    order: {
      type: Number,
      default: 0,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

collectionSchema.index({ profile: 1, order: 1 });

const Collection: Model<ICollection> = mongoose.model<ICollection>(
  "Collection",
  collectionSchema,
);

export default Collection;

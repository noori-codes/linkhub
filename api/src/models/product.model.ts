import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  profile: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  isVisible: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: [true, "Product must belong to a profile."],
      index: true,
    },

    title: {
      type: String,
      required: [true, "Please provide a product title."],
      trim: true,
      maxlength: [120, "Title must be at most 120 characters."],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters."],
      default: "",
    },

    imageUrl: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  },
);

productSchema.index({ profile: 1, order: 1 });

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "Product",
  productSchema,
);

export default Product;

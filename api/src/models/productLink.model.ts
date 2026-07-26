import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProductLink extends Document {
  product: Types.ObjectId;
  title: string;
  url: string;
  isAffiliate: boolean;
  order: number;
  isVisible: boolean;
}

const productLinkSchema = new Schema<IProductLink>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product link must belong to a product."],
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

    isAffiliate: {
      type: Boolean,
      default: false,
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

productLinkSchema.index({ product: 1, order: 1 });

const ProductLink: Model<IProductLink> = mongoose.model<IProductLink>(
  "ProductLink",
  productLinkSchema,
);

export default ProductLink;

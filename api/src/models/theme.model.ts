import mongoose, { Document, Model, Schema } from "mongoose";

export interface IThemeTokens {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
}

export interface ITheme extends Document {
  name: string;
  slug: string;
  tokens: IThemeTokens;
  isDefault: boolean;
}

const themeTokensSchema = new Schema<IThemeTokens>(
  {
    backgroundColor: {
      type: String,
      required: true,
      default: "#ffffff",
    },
    textColor: {
      type: String,
      required: true,
      default: "#111111",
    },
    buttonColor: {
      type: String,
      required: true,
      default: "#111111",
    },
    buttonTextColor: {
      type: String,
      required: true,
      default: "#ffffff",
    },
    fontFamily: {
      type: String,
      required: true,
      default: "Inter, sans-serif",
    },
  },
  { _id: false },
);

const themeSchema = new Schema<ITheme>(
  {
    name: {
      type: String,
      required: [true, "Please provide a theme name."],
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: [true, "Please provide a theme slug."],
      unique: true,
      lowercase: true,
      trim: true,
    },

    tokens: {
      type: themeTokensSchema,
      required: true,
      default: () => ({}),
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Theme: Model<ITheme> = mongoose.model<ITheme>("Theme", themeSchema);

export default Theme;

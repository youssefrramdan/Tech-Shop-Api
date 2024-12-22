import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Category name must be unique"],
      trim: true,
      required: [true, "Category name is required"],
      minLength: [2, "Too short category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      minLength: [30, "Too short category description"],
      maxLength: [20000, "Too long category description"],
    },
    imageCover: {
      type: String,
      required: [true, "Category cover image is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Category = mongoose.model("Category", categorySchema);

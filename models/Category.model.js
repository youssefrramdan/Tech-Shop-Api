import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const schema = mongoose.Schema(
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
      required: [true, "Category description is required"],
      minLength: [30, "Too short category description"],
      maxLength: [20000, "Too long category description"],
    },
    imageCover: {
      type: String,
      required: [true, "Category cover image is required"],
    },
    products: [
      {
        type: Types.ObjectId,
        ref: "Product", // Reference to products under this category
      },
    ],
    createdBy: {
      type: Types.ObjectId,
      ref: "User", // Reference to the user who created this category
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook for slug generation
schema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/ /g, "-");
  }
  next();
});

export const Category = mongoose.model("Category", schema);

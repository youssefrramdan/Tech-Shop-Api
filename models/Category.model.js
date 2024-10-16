import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
dotenv.config()
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
      required: true,
    },
    image: String,
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware to set the image URL after fetching the document
schema.post("init", function (doc) {
  if (doc.image) {
    doc.image = process.env.BASE_URL+"categories/" + doc.image;
  }
});

export const Category = mongoose.model("Category", schema);

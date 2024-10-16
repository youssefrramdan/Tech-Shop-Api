import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const schema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name is required"],
      trim: true,
      required: true,
      minLength: [2, "too short category name"],
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    logo: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Update the logo to include the full URL
schema.post("init", function (doc) {
  if (doc.logo) {
    doc.logo = `https://res.cloudinary.com/dthsq3uel/image/upload/${doc.logo}`
  }
});

export const Brand = mongoose.model("Brand", schema);

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
schema.post("init", function (doc) {
  if (doc.logo) {
    doc.logo = process.env.BASE_URL+"brands/" + doc.logo;
  }
});
export const Brand = mongoose.model("Brand", schema);

import mongoose from 'mongoose';

const brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, 'name is required'],
      trim: true,
      required: true,
      minLength: [2, 'too short category name'],
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

export default mongoose.model('Brand', brandSchema);

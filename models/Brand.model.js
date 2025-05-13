import mongoose from 'mongoose';
import slugify from 'slugify';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Brand name must be at least 2 characters long'],
      maxlength: [32, 'Brand name cannot exceed 32 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create slug from name before saving
brandSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

export default mongoose.model('Brand', brandSchema);

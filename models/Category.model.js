import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [32, 'Category name cannot exceed 32 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      minLength: [30, 'Too short category description'],
      maxLength: [20000, 'Too long category description'],
    },
    imageCover: {
      type: String,
      required: [true, 'Category cover image is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to get products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Create slug from name before saving
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

export default mongoose.model('Category', categorySchema);

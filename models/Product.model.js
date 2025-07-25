import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Product title must be at least 3 characters long'],
      maxlength: [100, 'Product title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [
        10,
        'Product description must be at least 10 characters long',
      ],
    },
    imageCover: String,
    images: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    priceAfterDiscount: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
      required: [true, 'Product brand is required'],
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0 '],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    // Rental fields
    isRentable: {
      type: Boolean,
      default: false,
    },
    rentalPricePerDay: {
      type: Number,
      min: [0, 'Rental price cannot be negative'],
    },
    rentalDeposit: {
      type: Number,
      min: [0, 'Rental deposit cannot be negative'],
      default: 0,
    },
    availableForRental: {
      type: Boolean,
      default: true,
    },
    rentalStock: {
      type: Number,
      min: [0, 'Rental stock cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Add text index for search functionality
productSchema.index({ title: 'text', description: 'text' });

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name' });
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;

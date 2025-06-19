import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Rental must belong to a user'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Rental must belong to a product'],
    },
    startDate: {
      type: Date,
      required: [true, 'Rental start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Rental end date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    depositAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total days and price before saving
rentalSchema.pre('save', async function (next) {
  if (this.startDate && this.endDate) {
    // Calculate total days (including start and end dates)
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Get product details to calculate total price
    const product = await mongoose.model('Product').findById(this.product);
    if (product && product.rentalPricePerDay) {
      this.totalPrice = this.totalDays * product.rentalPricePerDay;
    }
  }
  next();
});

// Populate user and product information
rentalSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email phone',
  }).populate({
    path: 'product',
    select: 'title rentalPricePerDay imageCover',
  });
  next();
});

// Validate rental period
rentalSchema.pre('save', async function (next) {
  const product = await mongoose.model('Product').findById(this.product);

  if (!product.isRentable) {
    throw new Error('This product is not available for rent');
  }

  if (this.totalDays < product.minimumRentalDays) {
    throw new Error(
      `Minimum rental period is ${product.minimumRentalDays} days`
    );
  }

  if (this.totalDays > product.maximumRentalDays) {
    throw new Error(
      `Maximum rental period is ${product.maximumRentalDays} days`
    );
  }

  next();
});

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;

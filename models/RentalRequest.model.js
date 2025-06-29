import mongoose from 'mongoose';

const rentalRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Rental request must belong to a user'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Rental request must include a product'],
    },
    // Personal Information
    personalInfo: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      idCardNumber: {
        type: String,
        required: [true, 'ID card number is required'],
        trim: true,
      },
    },
    // ID Card Images
    idCardImages: {
      front: {
        type: String,
        required: [true, 'Front side of ID card is required'],
      },
      back: {
        type: String,
        required: [true, 'Back side of ID card is required'],
      },
    },
    // Rental Period
    requestedStartDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    requestedEndDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    rentalDays: {
      type: Number,
      required: true,
    },
    // Pricing
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: [0, 'Daily rate cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    depositAmount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
      min: [0, 'Deposit amount cannot be negative'],
    },
    // Request Status
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'active',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    // Admin fields
    adminNotes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectedAt: Date,
    // Actual rental dates (after approval)
    actualStartDate: Date,
    actualEndDate: Date,
    // Return information
    returnedAt: Date,
    returnCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    },
    depositReturned: {
      type: Boolean,
      default: false,
    },
    depositReturnedAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
rentalRequestSchema.index({ user: 1, status: 1 });
rentalRequestSchema.index({ product: 1, status: 1 });
rentalRequestSchema.index({ status: 1, createdAt: -1 });

// Calculate rental days before saving
rentalRequestSchema.pre('save', function (next) {
  if (this.requestedStartDate && this.requestedEndDate) {
    const startDate = new Date(this.requestedStartDate);
    const endDate = new Date(this.requestedEndDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    this.rentalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  next();
});

// Populate user and product info
rentalRequestSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email phone',
  })
    .populate({
      path: 'product',
      select: 'title imageCover rentalPricePerDay rentalDeposit',
    })
    .populate({
      path: 'approvedBy',
      select: 'name email',
    });
  next();
});

const RentalRequest = mongoose.model('RentalRequest', rentalRequestSchema);
export default RentalRequest;

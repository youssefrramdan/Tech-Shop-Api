import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    profileImage: {
      type: String,
      default:
        'https://static.vecteezy.com/system/resources/previews/039/845/042/non_2x/male-default-avatar-profile-gray-picture-grey-photo-placeholder-gray-profile-anonymous-face-picture-illustration-isolated-on-white-background-free-vector.jpg',
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    passwordResetExpires: Date,
    passwordResetCode: String,
    passwordResetVerified: Boolean,
    passwordChangedAt: Date,
    wishlist: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
        },
      },
    ],
    addresses: [
      {
        city: String,
        phone: String,
        street: String,
      },
    ],
    cart: {
      type: mongoose.Types.ObjectId,
      ref: 'Cart',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
// Remove interests population from pre-find middleware
userSchema.pre(/^find/, function (next) {
  this.select('-__v -createdAt -updatedAt');
  next();
});

// Hash password middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method - essential utility method kept in schema
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('Password not loaded for comparison');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.index({ email: 1 });
userSchema.index({ createdTeam: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);

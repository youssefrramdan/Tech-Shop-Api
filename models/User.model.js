import mongoose from "mongoose";
import bcrypt from "bcrypt";

const schema = mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordChangedAt: Date,
    wishlist: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
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
      ref: "Cart",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// schema.pre("save", function () {
//   this.password = bcrypt.hashSync(this.password, 8);
// });

// schema.pre("findOneAndUpdate", function () {
//   const update = this.getUpdate();
//   if (update.password) {
//     update.password = bcrypt.hashSync(update.password, 8);
//   }
// });

export const User = mongoose.model("User", schema);

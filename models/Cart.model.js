import mongoose, { Schema, Types } from "mongoose";

const schema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    cartItems: [
      {
        product: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalCartPriceAfterDiscount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Cart = mongoose.model("Cart", schema);

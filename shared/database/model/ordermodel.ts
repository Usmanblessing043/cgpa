import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],

    total: Number,
    deliveryAddress: String,

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "accepted",
        "picked_up",
        "in_transit",
        "delivered",
      ],
      default: "pending",
    },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deliveryOTP: String,
    otpExpires: Date,
    rejectedBy: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    statusHistory: [
      {
        status: String,
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);
// backend/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      image: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],

  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },

  paymentMethod: {
    type: String,
    required: true,
enum: ["COD", "Razorpay", "Card", "UPI", "NetBanking", "Wallet"],
  },

  paymentInfo: {
    id: String,
    status: String,
    paidAt: Date,
  },

  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },

  orderStatus: {
    type: String,
    enum: ["Payment Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },

  // ✅ NEW: cancellation info
  cancelReason: { type: String, default: "" },
  cancelNote: { type: String, default: "" },
  cancelledAt: { type: Date },

  deliveredAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
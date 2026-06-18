import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  depositAmount: Number,
  amountPayable: Number,
  currency: {
    type: String,
    default: "INR",
  },
  paymentProvider: String,
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  bookingStatus: {
    type: String,
    enum: [
      "pending",
      "paid",
      "owner_accepted",
      "in_transit",
      "delivered",
      "owner_rejected",
      "confirmed",
      "cancelled",
      "completed",
    ],
    default: "pending",
  },
  paymentId: String,
  paymentOrderId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date,
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  renter: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  depositAmount: Number,
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
  },
  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
  },
  paymentId: String,
  createdAt: Date,
  updatedAt: Date,
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
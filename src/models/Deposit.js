import mongoose from "mongoose";

const depositSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true,
    index: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  depositStatus: {
    type: String,
    enum: ["LOCKED", "RELEASED"],
    default: "LOCKED",
    index: true,
  },
  lockedAt: {
    type: Date,
    default: Date.now,
  },
  releasedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);

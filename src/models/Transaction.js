import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    index: true,
  },
  user: {
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
  type: {
    type: String,
    enum: ["RENT_EARNING", "DEPOSIT_REFUND"],
    required: true,
    index: true,
  },
  status: {
    type: String,
    default: "COMPLETED",
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

transactionSchema.index({ booking: 1, user: 1, type: 1 }, { unique: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

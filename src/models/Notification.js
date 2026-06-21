import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" },
    isRead: { type: Boolean, default: false },
    actionTaken: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    profileImage: String,
    isVerified: { type: Boolean, default: false },
    
    address: {
      city: String,
      state: String,
      pincode: String,
    },
    
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);

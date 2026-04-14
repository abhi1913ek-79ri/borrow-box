import mongoose, { Types } from "mongoose";

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  itemType: {
    type: Types.Enumerator,
    values: ["tool", "electronics", "vehicle", "furniture"],
  },
  category: String,
  pricePerDay: Number,
  pricePerHour: Number,
  depositAmount: Number,
  images: {
    type: [String],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
  },
  location: {
    address: String,
    city: String,
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
  },
  availability: {
    isAvailable: Boolean,
    default: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }  ,
  rating: Number,
  totalReviews: Number,
  createdAt: Date,
  updatedAt: Date,
});

function arrayLimit(val) {
  return val.length <= 5;
}   

export default mongoose.models.Item || mongoose.model("Item", itemSchema);
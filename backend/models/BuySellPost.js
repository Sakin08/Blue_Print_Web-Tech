import mongoose from "mongoose";

const buySellPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    images: [{ type: String }], // Multiple images
    image: { type: String }, // Keep for backward compatibility
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("BuySellPost", buySellPostSchema);

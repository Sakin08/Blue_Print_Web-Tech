import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "electronics",
        "books",
        "id-cards",
        "keys",
        "clothing",
        "accessories",
        "other",
      ],
      required: true,
    },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    images: [{ type: String }],
    contactInfo: { type: String, required: true },
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "claimed", "resolved"],
      default: "active",
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    views: { type: Number, default: 0 },
    color: { type: String },
    brand: { type: String },
    identifyingFeatures: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LostFound", lostFoundSchema);

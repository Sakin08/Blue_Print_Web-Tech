import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
    transactionType: {
      type: String,
      enum: ["buysell", "housing", "event", "general"],
      default: "general",
    },
    relatedItem: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same transaction
reviewSchema.index(
  { reviewer: 1, reviewee: 1, relatedItem: 1 },
  { unique: true }
);

export default mongoose.model("Review", reviewSchema);

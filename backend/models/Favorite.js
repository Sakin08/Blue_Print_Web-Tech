import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postType: { type: String, enum: ["buysell", "housing"], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicates
favoriteSchema.index({ user: 1, postType: 1, postId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);

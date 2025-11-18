import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportedItem: { type: mongoose.Schema.Types.ObjectId },
    itemType: {
      type: String,
      enum: ["user", "buysell", "housing", "event", "message"],
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "inappropriate", "scam", "harassment", "fake", "other"],
      required: true,
    },
    description: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    adminNotes: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);

import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["event", "price_drop", "saved_item", "custom"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    reminderDate: { type: Date, required: true },
    relatedItem: { type: mongoose.Schema.Types.ObjectId },
    itemType: { type: String, enum: ["event", "buysell", "housing"] },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
    recurring: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
  },
  { timestamps: true }
);

reminderSchema.index({ user: 1, reminderDate: 1 });

export default mongoose.model("Reminder", reminderSchema);

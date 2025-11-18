import mongoose from "mongoose";

const donationHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  location: { type: String },
  status: {
    type: String,
    enum: ["completed", "pending"],
    default: "completed",
  },
  notes: { type: String },
});

const bloodDonorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    lastDonationDate: { type: Date },
    nextEligibleDate: { type: Date },
    donationHistory: [donationHistorySchema],
    isAvailable: { type: Boolean, default: true },
    totalDonations: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bloodDonorSchema.index({ bloodGroup: 1, isAvailable: 1 });
bloodDonorSchema.index({ nextEligibleDate: 1 });

export default mongoose.model("BloodDonor", bloodDonorSchema);

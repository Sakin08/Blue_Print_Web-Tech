import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    images: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    interested: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Booking & Reservation
    capacity: { type: Number, default: 0 }, // 0 = unlimited
    rsvpCount: { type: Number, default: 0 },
    requiresRSVP: { type: Boolean, default: false },
    waitlistEnabled: { type: Boolean, default: false },

    // Map Integration
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // Additional Info
    category: {
      type: String,
      enum: ["academic", "sports", "cultural", "social", "workshop", "other"],
      default: "other",
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);

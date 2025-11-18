import mongoose from "mongoose";

const rsvpSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["going", "maybe", "not_going", "waitlist"],
      default: "going",
    },
    guestCount: { type: Number, default: 1, min: 1 },
    notes: { type: String, maxlength: 200 },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate RSVPs
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model("RSVP", rsvpSchema);

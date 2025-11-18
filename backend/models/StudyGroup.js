import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: String, required: true },
    description: { type: String, required: true },
    subject: {
      type: String,
      enum: ["CSE", "EEE", "Math", "Physics", "Chemistry", "English", "Other"],
      required: true,
    },
    meetingType: {
      type: String,
      enum: ["online", "in-person", "hybrid"],
      default: "hybrid",
    },
    location: { type: String },
    meetingLink: { type: String },
    schedule: { type: String },
    maxMembers: { type: Number, default: 0 }, // 0 = unlimited
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StudyGroup", studyGroupSchema);

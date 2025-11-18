import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "freelance", "work-study"],
      required: true,
    },
    location: { type: String, required: true },
    salary: { type: String },
    duration: { type: String },
    requirements: { type: String },
    applicationDeadline: { type: Date },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    applicationLink: { type: String },
    skills: [{ type: String }],
    images: [{ type: String }],
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);

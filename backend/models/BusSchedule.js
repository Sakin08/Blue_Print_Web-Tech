import mongoose from "mongoose";

const busScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "SUST Bus Schedule",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BusSchedule", busScheduleSchema);

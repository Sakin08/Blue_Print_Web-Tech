import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "event_created",
        "event_interest",
        "new_message",
        "item_posted",
        "housing_posted",
        "event_posted",
        "job_posted",
        "food_posted",
        "buysell_posted",
        "lostfound_posted",
        "studygroup_posted",
        "comment_added",
        "post_liked",
        "like_added",
        "rsvp_added",
        "interested_added",
        "join_added",
        "blood_posted",
        "blood_request",
        "blood_response",
        "admin_announcement",
        "admin_warning",
        "admin_info",
        "system_alert",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed }, // Additional data
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

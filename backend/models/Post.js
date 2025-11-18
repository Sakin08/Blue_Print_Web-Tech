import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "event",
        "job",
        "housing",
        "buysell",
        "food",
        "lostfound",
        "blood",
        "studygroup",
        "achievement",
      ],
      default: "text",
    },
    content: {
      text: { type: String },
      images: [{ type: String }],
      link: { type: String },
    },
    // Reference to original post if this is a share
    sharedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    // Reference to related content
    relatedContent: {
      contentType: {
        type: String,
        enum: [
          "Event",
          "Job",
          "HousingPost",
          "BuySellPost",
          "FoodOrder",
          "LostFound",
          "BloodRequest",
          "StudyGroup",
        ],
      },
      contentId: { type: mongoose.Schema.Types.ObjectId },
    },
    // Interactions
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    shares: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    saves: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Visibility
    visibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },
    // Engagement metrics
    engagementScore: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    // Tags
    tags: [{ type: String }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ engagementScore: -1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Calculate engagement score
postSchema.methods.calculateEngagement = function () {
  this.engagementScore =
    this.likes.length * 1 +
    this.comments.length * 2 +
    this.shares.length * 3 +
    this.saves.length * 1.5;
  return this.engagementScore;
};

export default mongoose.model("Post", postSchema);

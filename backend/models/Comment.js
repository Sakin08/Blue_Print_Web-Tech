import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 500 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postType: {
      type: String,
      enum: [
        "buysell",
        "housing",
        "event",
        "studygroup",
        "job",
        "food",
        "lostfound",
        "bloodrequest",
      ],
      required: true,
    },
    postId: { type: mongoose.Schema.Types.ObjectId, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }, // For replies
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users mentioned in comment
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User being replied to
  },
  { timestamps: true }
);

commentSchema.index({ postType: 1, postId: 1 });

export default mongoose.model("Comment", commentSchema);

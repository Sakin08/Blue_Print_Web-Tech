import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { notifyContentOwner } from "./notificationController.js";

export const createComment = async (req, res) => {
  try {
    const { content, postType, postId, parentComment, replyTo, mentions } =
      req.body;

    const comment = await Comment.create({
      content,
      author: req.user._id,
      postType,
      postId,
      parentComment,
      replyTo,
      mentions: mentions || [],
    });

    await comment.populate("author", "name profilePicture");
    await comment.populate("replyTo", "name");

    // Get post owner and notify them (if not replying to someone)
    if (!replyTo) {
      try {
        const postOwner = await getPostOwner(postType, postId);
        if (postOwner && postOwner.toString() !== req.user._id.toString()) {
          await notifyContentOwner(
            postOwner,
            req.user._id,
            "comment",
            `your ${postType}`,
            `/${postType}/${postId}`
          );
        }
      } catch (notifError) {
        console.error("Failed to send comment notification:", notifError);
      }
    }

    // Notify user being replied to
    if (replyTo && replyTo.toString() !== req.user._id.toString()) {
      try {
        const repliedUser = await User.findById(replyTo);
        if (repliedUser) {
          await Notification.create({
            recipient: replyTo,
            sender: req.user._id,
            type: "comment_added",
            title: `${req.user.name} replied to your comment`,
            message: content.substring(0, 100),
            link: `/${postType}/${postId}`,
          });

          // Emit socket event
          if (req.app.get("io")) {
            const io = req.app.get("io");
            io.to(`user_${replyTo}`).emit("notification", {
              type: "comment_reply",
              message: `${req.user.name} replied to your comment`,
            });
          }
        }
      } catch (notifError) {
        console.error("Failed to send reply notification:", notifError);
      }
    }

    // Notify mentioned users
    if (mentions && mentions.length > 0) {
      try {
        const mentionNotifications = mentions
          .filter((userId) => userId.toString() !== req.user._id.toString())
          .map((userId) => ({
            recipient: userId,
            sender: req.user._id,
            type: "comment_added",
            title: `${req.user.name} mentioned you in a comment`,
            message: content.substring(0, 100),
            link: `/${postType}/${postId}`,
          }));

        if (mentionNotifications.length > 0) {
          await Notification.insertMany(mentionNotifications);

          // Emit socket events
          if (req.app.get("io")) {
            const io = req.app.get("io");
            mentions.forEach((userId) => {
              if (userId.toString() !== req.user._id.toString()) {
                io.to(`user_${userId}`).emit("notification", {
                  type: "mention",
                  message: `${req.user.name} mentioned you in a comment`,
                });
              }
            });
          }
        }
      } catch (notifError) {
        console.error("Failed to send mention notifications:", notifError);
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get post owner based on post type
async function getPostOwner(postType, postId) {
  try {
    let Model;
    switch (postType) {
      case "event":
        Model = (await import("../models/Event.js")).default;
        break;
      case "housing":
        Model = (await import("../models/Housing.js")).default;
        break;
      case "buysell":
        Model = (await import("../models/BuySell.js")).default;
        break;
      case "job":
        Model = (await import("../models/Job.js")).default;
        break;
      case "food":
        Model = (await import("../models/FoodOrder.js")).default;
        break;
      case "lostfound":
        Model = (await import("../models/LostFound.js")).default;
        break;
      case "studygroup":
        Model = (await import("../models/StudyGroup.js")).default;
        break;
      case "post":
        Model = (await import("../models/Post.js")).default;
        const post = await Model.findById(postId).select("author");
        return post?.author;
      default:
        return null;
    }

    const post = await Model.findById(postId).select("user");
    return post?.user;
  } catch (error) {
    console.error("Error getting post owner:", error);
    return null;
  }
}

export const getComments = async (req, res) => {
  try {
    const { postType, postId } = req.query;

    // Get all comments for this post
    const allComments = await Comment.find({
      postType,
      postId,
    })
      .populate("author", "name profilePicture")
      .populate("replyTo", "name")
      .populate("mentions", "name")
      .sort({ createdAt: -1 });

    // Organize comments with their replies
    const topLevelComments = allComments.filter((c) => !c.parentComment);
    const commentMap = {};

    allComments.forEach((comment) => {
      commentMap[comment._id] = { ...comment.toObject(), replies: [] };
    });

    allComments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) {
          parent.replies.push(commentMap[comment._id]);
        }
      }
    });

    const result = topLevelComments.map((c) => commentMap[c._id]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isLiked = comment.likes.includes(req.user._id);

    if (isLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow admin or owner to delete
    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

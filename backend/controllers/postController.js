import Post from "../models/Post.js";
import User from "../models/User.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Create a new post
export const createPost = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { text, type, visibility, tags, relatedContent } = req.body;

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      const postData = {
        author: req.user._id,
        type: type || "text",
        content: {
          text,
          images: imageUrls,
        },
        visibility: visibility || "public",
        tags: tags ? JSON.parse(tags) : [],
      };

      if (relatedContent) {
        postData.relatedContent = JSON.parse(relatedContent);
      }

      const post = await Post.create(postData);
      await post.populate(
        "author",
        "name email profilePicture department batch isStudentVerified"
      );

      // Notify followers
      const { notifyFollowers } = await import("./notificationController.js");
      await notifyFollowers(
        req.user._id,
        "post",
        text?.substring(0, 50) || "New post",
        `/feed`
      );

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// Get feed for current user
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, filter = "following" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (filter === "following") {
      // Get posts from followed users
      const user = await User.findById(req.user._id).select("following");
      const followingIds = user.following || [];
      query.author = { $in: [...followingIds, req.user._id] };
    } else if (filter === "trending") {
      // Get trending posts (high engagement)
      query.engagementScore = { $gte: 5 };
    }
    // 'all' filter shows all public posts

    query.visibility = { $in: ["public", "followers"] };

    const posts = await Post.find(query)
      .populate(
        "author",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("sharedPost")
      .populate("likes.user", "name profilePicture")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate(
        "author",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("sharedPost")
      .populate("likes.user", "name profilePicture")
      .populate("comments.user", "name profilePicture");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { text, visibility, tags } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (text) post.content.text = text;
    if (visibility) post.visibility = visibility;
    if (tags) post.tags = JSON.parse(tags);

    await post.save();
    await post.populate(
      "author",
      "name email profilePicture department batch isStudentVerified"
    );

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Allow admin or owner to delete
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: req.user._id });

      // Notify post owner about the like
      if (post.author._id.toString() !== req.user._id.toString()) {
        const { notifyContentOwner } = await import(
          "./notificationController.js"
        );
        await notifyContentOwner(
          post.author._id,
          req.user._id,
          "like",
          post.content.text?.substring(0, 50) || "your post",
          `/post/${post._id}`
        );
      }
    }

    post.calculateEngagement();
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      text,
    });

    // Notify post owner about the comment
    if (post.author._id.toString() !== req.user._id.toString()) {
      const { notifyContentOwner } = await import(
        "./notificationController.js"
      );
      await notifyContentOwner(
        post.author._id,
        req.user._id,
        "comment",
        post.content.text?.substring(0, 50) || "your post",
        `/post/${post._id}`
      );
    }

    post.calculateEngagement();
    await post.save();
    await post.populate("comments.user", "name profilePicture");

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Allow admin or owner to delete
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.remove();
    post.calculateEngagement();
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { text } = req.body;

    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add to shares
    originalPost.shares.push({ user: req.user._id });
    originalPost.calculateEngagement();
    await originalPost.save();

    // Create new post as share
    const sharedPost = await Post.create({
      author: req.user._id,
      type: "text",
      content: { text: text || "" },
      sharedPost: originalPost._id,
      visibility: "public",
    });

    await sharedPost.populate(
      "author",
      "name email profilePicture department batch isStudentVerified"
    );
    await sharedPost.populate("sharedPost");

    res.status(201).json(sharedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save/Unsave post
export const toggleSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const saveIndex = post.saves.findIndex(
      (save) => save.user.toString() === req.user._id.toString()
    );

    if (saveIndex > -1) {
      post.saves.splice(saveIndex, 1);
    } else {
      post.saves.push({ user: req.user._id });
    }

    post.calculateEngagement();
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get saved posts
export const getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      "saves.user": req.user._id,
    })
      .populate(
        "author",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("sharedPost")
      .sort({ "saves.createdAt": -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate(
        "author",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("sharedPost")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trending topics (hashtags)
export const getTrendingTopics = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Get all posts from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await Post.find({
      createdAt: { $gte: sevenDaysAgo },
      visibility: "public",
    }).select("content.text tags");

    // Extract hashtags from posts
    const hashtagCount = {};

    posts.forEach((post) => {
      // Extract hashtags from text
      const text = post.content?.text || "";
      const hashtags = text.match(/#[\w]+/g) || [];

      // Also include tags array
      const allTags = [...hashtags, ...(post.tags || [])];

      allTags.forEach((tag) => {
        const normalizedTag = tag.startsWith("#") ? tag : `#${tag}`;
        hashtagCount[normalizedTag] = (hashtagCount[normalizedTag] || 0) + 1;
      });
    });

    // Convert to array and sort by count
    const trending = Object.entries(hashtagCount)
      .map(([tag, count]) => ({
        tag,
        count,
        displayCount:
          count > 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get campus stats
export const getCampusStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Posts today
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: today },
    });

    // Active users (users who posted or interacted in last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentPosts = await Post.find({
      createdAt: { $gte: oneDayAgo },
    }).select("author likes.user comments.user");

    const activeUserIds = new Set();
    recentPosts.forEach((post) => {
      activeUserIds.add(post.author.toString());
      post.likes?.forEach((like) => activeUserIds.add(like.user.toString()));
      post.comments?.forEach((comment) =>
        activeUserIds.add(comment.user.toString())
      );
    });

    const activeUsers = activeUserIds.size;

    // Get events this week (if Event model exists)
    let eventsThisWeek = 0;
    try {
      const Event = (await import("../models/Event.js")).default;
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      eventsThisWeek = await Event.countDocuments({
        date: { $gte: weekStart, $lte: weekEnd },
      });
    } catch (err) {
      // Event model might not exist
    }

    res.json({
      activeUsers,
      postsToday,
      eventsThisWeek,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

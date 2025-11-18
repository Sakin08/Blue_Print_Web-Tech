import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Save a post
router.post("/save", protect, async (req, res) => {
  try {
    const { postId, postType } = req.body;
    console.log("Save post request:", {
      postId,
      postType,
      userId: req.user._id,
    });

    if (!postId || !postType) {
      return res.status(400).json({ message: "Post ID and type are required" });
    }

    const user = await User.findById(req.user._id);
    console.log(
      "User found:",
      user.name,
      "Current saved posts:",
      user.savedPosts.length
    );

    // Check if already saved
    const alreadySaved = user.savedPosts.some(
      (saved) =>
        saved.postId.toString() === postId && saved.postType === postType
    );

    if (alreadySaved) {
      console.log("Post already saved");
      return res.status(400).json({ message: "Post already saved" });
    }

    user.savedPosts.push({ postId, postType });
    await user.save();
    console.log(
      "Post saved successfully. Total saved posts:",
      user.savedPosts.length
    );

    res.json({
      message: "Post saved successfully",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Failed to save post" });
  }
});

// Unsave a post
router.delete("/unsave/:postId/:postType", protect, async (req, res) => {
  try {
    const { postId, postType } = req.params;

    const user = await User.findById(req.user._id);

    user.savedPosts = user.savedPosts.filter(
      (saved) =>
        !(saved.postId.toString() === postId && saved.postType === postType)
    );

    await user.save();

    res.json({
      message: "Post unsaved successfully",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ message: "Failed to unsave post" });
  }
});

// Get all saved posts
router.get("/my-saved", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log("Fetching saved posts for user:", user.name);
    console.log("Saved posts count:", user.savedPosts?.length || 0);
    console.log("Saved posts:", user.savedPosts);
    res.json(user.savedPosts || []);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Failed to fetch saved posts" });
  }
});

// Check if a post is saved
router.get("/is-saved/:postId/:postType", protect, async (req, res) => {
  try {
    const { postId, postType } = req.params;
    const user = await User.findById(req.user._id);

    const isSaved = user.savedPosts.some(
      (saved) =>
        saved.postId.toString() === postId && saved.postType === postType
    );

    res.json({ isSaved });
  } catch (error) {
    console.error("Error checking saved status:", error);
    res.status(500).json({ message: "Failed to check saved status" });
  }
});

export default router;

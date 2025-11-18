import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  sharePost,
  toggleSave,
  getSavedPosts,
  getUserPosts,
  getTrendingTopics,
  getCampusStats,
} from "../controllers/postController.js";

const router = express.Router();

// Post CRUD
router.post("/", protect, createPost);
router.get("/feed", protect, getFeed);
router.get("/saved", protect, getSavedPosts);
router.get("/trending-topics", protect, getTrendingTopics);
router.get("/campus-stats", protect, getCampusStats);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Interactions
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);
router.post("/:id/share", protect, sharePost);
router.post("/:id/save", protect, toggleSave);

export default router;

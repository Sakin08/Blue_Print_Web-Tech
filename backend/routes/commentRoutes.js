import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createComment,
  getComments,
  likeComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", protect, createComment);
router.get("/", getComments);
router.post("/:id/like", protect, likeComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

export default router;

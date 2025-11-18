import express from "express";
import {
  getChatHistory,
  getRecentChats,
  getUnreadCount,
  uploadChatFile,
  deleteMessageForMe,
  deleteMessageForEveryone,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/recent", protect, getRecentChats);
router.get("/unread-count", protect, getUnreadCount);
router.post("/upload", protect, uploadChatFile);
router.delete("/message/:messageId/delete-for-me", protect, deleteMessageForMe);
router.delete(
  "/message/:messageId/delete-for-everyone",
  protect,
  deleteMessageForEveryone
);
router.get("/:userId", protect, getChatHistory);

export default router;

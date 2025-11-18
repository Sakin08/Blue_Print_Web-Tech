import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAllQuickMenus,
  getQuickMenuById,
  createQuickMenu,
  updateQuickMenu,
  deleteQuickMenu,
  getTodayMenus,
  getMyMenus,
} from "../controllers/quickMenuController.js";

const router = express.Router();

// Public routes
router.get("/", getAllQuickMenus);
router.get("/today", getTodayMenus);
router.get("/:id", getQuickMenuById);

// Protected routes
router.post("/quick-post", protect, createQuickMenu);
router.get("/my/menus", protect, getMyMenus);
router.put("/:id", protect, updateQuickMenu);
router.delete("/:id", protect, deleteQuickMenu);

export default router;

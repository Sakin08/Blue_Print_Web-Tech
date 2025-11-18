import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getAllHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";

const router = express.Router();

// Public route - anyone can view holidays
router.get("/", getAllHolidays);

// Admin only routes
router.post("/", protect, adminOnly, createHoliday);
router.put("/:id", protect, adminOnly, updateHoliday);
router.delete("/:id", protect, adminOnly, deleteHoliday);

export default router;

import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createReminder,
  getMyReminders,
  getUpcomingReminders,
  updateReminder,
  deleteReminder,
} from "../controllers/reminderController.js";

const router = express.Router();

router.post("/", protect, createReminder);
router.get("/", protect, getMyReminders);
router.get("/upcoming", protect, getUpcomingReminders);
router.put("/:id", protect, updateReminder);
router.delete("/:id", protect, deleteReminder);

export default router;

import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  markInterested,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, adminOnly } from "../middleware/index.js"; // Now valid

const router = express.Router();

router.post("/", protect, createEvent); // Any logged-in user can create
router.get("/", getEvents);
router.get("/:id", getEventById);
router.patch("/:id/interested", protect, markInterested);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
export default router;

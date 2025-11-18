import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createRSVP,
  getEventRSVPs,
  getMyRSVPs,
  checkIn,
  deleteRSVP,
} from "../controllers/rsvpController.js";

const router = express.Router();

router.post("/", protect, createRSVP);
router.get("/my-rsvps", protect, getMyRSVPs);
router.get("/event/:eventId", getEventRSVPs);
router.post("/event/:eventId/checkin", protect, checkIn);
router.delete("/event/:eventId", protect, deleteRSVP);

export default router;

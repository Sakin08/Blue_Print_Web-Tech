import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createLostFound,
  getLostFoundItems,
  getLostFoundById,
  claimItem,
  updateItemStatus,
  deleteLostFound,
} from "../controllers/lostFoundController.js";

const router = express.Router();

router.post("/", protect, createLostFound);
router.get("/", getLostFoundItems);
router.get("/:id", getLostFoundById);
router.post("/:id/claim", protect, claimItem);
router.patch("/:id/status", protect, updateItemStatus);
router.delete("/:id", protect, deleteLostFound);

export default router;

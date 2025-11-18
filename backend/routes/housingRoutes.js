import express from "express";
import {
  createHousing,
  getHousings,
  getHousingById,
  updateHousing,
  deleteHousing,
} from "../controllers/housingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createHousing);
router.get("/", getHousings);
router.get("/:id", getHousingById);
router.put("/:id", protect, updateHousing);
router.delete("/:id", protect, deleteHousing);

export default router;

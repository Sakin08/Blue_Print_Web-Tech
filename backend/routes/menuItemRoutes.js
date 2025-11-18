import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createMenuItem,
  getMenuItemsByRestaurant,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} from "../controllers/menuItemController.js";

const router = express.Router();

router.post("/", protect, createMenuItem);
router.get("/restaurant/:restaurantId", getMenuItemsByRestaurant);
router.put("/:id", protect, updateMenuItem);
router.patch("/:id/toggle-availability", protect, toggleAvailability);
router.delete("/:id", protect, deleteMenuItem);

export default router;

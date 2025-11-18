import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createFoodMenu,
  getFoodMenus,
  getFoodMenuById,
  updateFoodMenu,
  deleteFoodMenu,
  updateMenuItemAvailability,
  addRating,
} from "../controllers/foodMenuController.js";

const router = express.Router();

router.post("/", protect, createFoodMenu);
router.get("/", getFoodMenus);
router.get("/:id", getFoodMenuById);
router.put("/:id", protect, updateFoodMenu);
router.delete("/:id", protect, deleteFoodMenu);
router.patch("/:id/item-availability", protect, updateMenuItemAvailability);
router.post("/:id/rating", protect, addRating);

export default router;

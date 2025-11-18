import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  verifyRestaurant,
  deleteRestaurant,
  getMyRestaurants,
} from "../controllers/restaurantController.js";

const router = express.Router();

router.post("/", protect, createRestaurant);
router.get("/", getRestaurants);
router.get("/my-restaurants", protect, getMyRestaurants);
router.get("/:id", getRestaurantById);
router.put("/:id", protect, updateRestaurant);
router.patch("/:id/verify", protect, verifyRestaurant);
router.delete("/:id", protect, deleteRestaurant);

export default router;

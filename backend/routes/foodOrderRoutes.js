import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addReview,
} from "../controllers/foodOrderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/restaurant/:restaurantId", protect, getRestaurantOrders);
router.get("/:id", protect, getOrderById);
router.patch("/:id/status", protect, updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder);
router.post("/:id/review", protect, addReview);

export default router;

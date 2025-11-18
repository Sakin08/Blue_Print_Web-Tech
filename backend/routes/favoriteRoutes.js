import express from "express";
import {
  toggleFavorite,
  getFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/toggle", protect, toggleFavorite);
router.get("/", protect, getFavorites);
router.get("/check", protect, checkFavorite);

export default router;

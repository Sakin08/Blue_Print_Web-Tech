import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  sendOTP,
  verifyOTPAndRegister,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

// New OTP-based registration
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPAndRegister);

// Legacy routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post(
  "/upload-profile-picture",
  protect,
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;

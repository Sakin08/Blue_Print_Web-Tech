import express from "express";
import { protect } from "../middleware/auth.js";
import {
  registerDonor,
  getDonors,
  getDonorByUserId,
  updateDonor,
  updateDonation,
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  respondToRequest,
  updateRequestStatus,
  deleteDonor,
  deleteBloodRequest,
} from "../controllers/bloodDonorController.js";

const router = express.Router();

// Donor routes
router.post("/register", protect, registerDonor);
router.get("/donors", getDonors);
router.get("/donors/:userId", getDonorByUserId);
router.put("/donor", protect, updateDonor);
router.post("/donation", protect, updateDonation);
router.delete("/donor", protect, deleteDonor);

// Request routes
router.post("/requests", protect, createBloodRequest);
router.get("/requests", getBloodRequests);
router.get("/requests/:id", getBloodRequestById);
router.post("/requests/:id/respond", protect, respondToRequest);
router.patch("/requests/:id/status", protect, updateRequestStatus);
router.delete("/requests/:id", protect, deleteBloodRequest);

export default router;

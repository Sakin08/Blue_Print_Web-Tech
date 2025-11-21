import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createJob,
  getJobs,
  getJobById,
  applyToJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.post("/:id/apply", protect, applyToJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;

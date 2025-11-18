import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
  banUser,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/my-reports", protect, getMyReports);
router.get("/all", protect, getAllReports);
router.patch("/:id/status", protect, updateReportStatus);
router.post("/ban/:id", protect, banUser);

export default router;

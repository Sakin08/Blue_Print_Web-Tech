import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createStudyGroup,
  getStudyGroups,
  getStudyGroupById,
  joinStudyGroup,
  leaveStudyGroup,
  deleteStudyGroup,
} from "../controllers/studyGroupController.js";

const router = express.Router();

router.post("/", protect, createStudyGroup);
router.get("/", getStudyGroups);
router.get("/:id", getStudyGroupById);
router.post("/:id/join", protect, joinStudyGroup);
router.post("/:id/leave", protect, leaveStudyGroup);
router.delete("/:id", protect, deleteStudyGroup);

export default router;

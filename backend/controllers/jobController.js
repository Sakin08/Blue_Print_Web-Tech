import Job from "../models/Job.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const createJob = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        title,
        company,
        description,
        type,
        location,
        salary,
        duration,
        requirements,
        applicationDeadline,
        contactEmail,
        contactPhone,
        applicationLink,
        skills,
      } = req.body;

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      const job = await Job.create({
        title,
        company,
        description,
        type,
        location,
        salary,
        duration,
        requirements,
        applicationDeadline,
        contactEmail,
        contactPhone,
        applicationLink,
        skills: skills ? JSON.parse(skills) : [],
        images: imageUrls,
        poster: req.user._id,
      });

      await job.populate(
        "poster",
        "name email profilePicture department batch isStudentVerified"
      );

      res.status(201).json(job);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate(
        "poster",
        "name email profilePicture department batch isStudentVerified"
      )
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "poster",
      "name email profilePicture department batch isStudentVerified"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.views = (job.views || 0) + 1;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.applicants.includes(req.user._id)) {
      return res.status(400).json({ message: "Already applied" });
    }

    job.applicants.push(req.user._id);
    await job.save();

    res.json({ message: "Application submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Allow admin or owner to delete
    const isOwner = job.poster.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

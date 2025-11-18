import Report from "../models/Report.js";
import User from "../models/User.js";

// Create report
export const createReport = async (req, res) => {
  try {
    const { reportedUser, reportedItem, itemType, reason, description } =
      req.body;

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      reportedItem,
      itemType,
      reason,
      description,
    });

    // Increment reported count
    if (reportedUser) {
      await User.findByIdAndUpdate(reportedUser, {
        $inc: { reportedCount: 1 },
      });
    }

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's reports
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all reports
export const getAllReports = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update report status
export const updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        resolvedBy: req.user._id,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      },
      { new: true }
    );

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Ban user
export const banUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { banReason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason },
      { new: true }
    ).select("-password");

    res.json({ message: "User banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

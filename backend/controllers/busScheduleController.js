import BusSchedule from "../models/BusSchedule.js";
import { uploadImage } from "../services/cloudinaryService.js";

// Get active bus schedule
export const getActiveSchedule = async (req, res) => {
  try {
    const schedule = await BusSchedule.findOne({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload new bus schedule (admin only)
export const uploadSchedule = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // Upload image to cloudinary
    const imageUrl = await uploadImage(req.file);

    // Deactivate all previous schedules
    await BusSchedule.updateMany({}, { isActive: false });

    // Create new schedule
    const schedule = await BusSchedule.create({
      title: title || "SUST Bus Schedule",
      description,
      imageUrl,
      isActive: true,
      uploadedBy: req.user._id,
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete schedule (admin only)
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await BusSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

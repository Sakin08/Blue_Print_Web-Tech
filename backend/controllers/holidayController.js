import Holiday from "../models/Holiday.js";

// Get all holidays
export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create holiday (admin only)
export const createHoliday = async (req, res) => {
  try {
    const { name, date, type, description } = req.body;

    const holiday = await Holiday.create({
      name,
      date,
      type,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update holiday (admin only)
export const updateHoliday = async (req, res) => {
  try {
    const { name, date, type, description } = req.body;

    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { name, date, type, description },
      { new: true, runValidators: true }
    );

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete holiday (admin only)
export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

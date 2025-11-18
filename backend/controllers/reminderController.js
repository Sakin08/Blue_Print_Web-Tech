import Reminder from "../models/Reminder.js";

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      reminderDate,
      relatedItem,
      itemType,
      recurring,
    } = req.body;

    const reminder = await Reminder.create({
      user: req.user._id,
      type,
      title,
      description,
      reminderDate,
      relatedItem,
      itemType,
      recurring,
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's reminders
export const getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user._id,
      reminderDate: { $gte: new Date() },
    }).sort({ reminderDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming reminders (next 7 days)
export const getUpcomingReminders = async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const reminders = await Reminder.find({
      user: req.user._id,
      reminderDate: {
        $gte: new Date(),
        $lte: nextWeek,
      },
      sent: false,
    }).sort({ reminderDate: 1 });

    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    Object.assign(reminder, req.body);
    await reminder.save();

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark reminder as sent (for background job)
export const markReminderSent = async (reminderId) => {
  try {
    await Reminder.findByIdAndUpdate(reminderId, {
      sent: true,
      sentAt: new Date(),
    });
  } catch (error) {
    console.error("Error marking reminder as sent:", error);
  }
};

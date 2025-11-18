import Event from "../models/Event.js";
import cron from "node-cron";

// Function to delete expired events
const deleteExpiredEvents = async () => {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Find and delete events that ended more than 30 minutes ago
    const result = await Event.deleteMany({
      date: { $lt: thirtyMinutesAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️  Cleaned up ${result.deletedCount} expired events`);
    }
  } catch (error) {
    console.error("Error cleaning up expired events:", error);
  }
};

// Schedule cleanup to run every 10 minutes
const startEventCleanup = () => {
  cron.schedule("*/10 * * * *", () => {
    deleteExpiredEvents();
  });

  console.log("✅ Event cleanup service started - runs every 10 minutes");

  // Run once immediately on startup
  deleteExpiredEvents();
};

export { startEventCleanup, deleteExpiredEvents };

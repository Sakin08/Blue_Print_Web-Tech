import RSVP from "../models/RSVP.js";
import Event from "../models/Event.js";
import { createNotification } from "./notificationController.js";

// Create or update RSVP
export const createRSVP = async (req, res) => {
  try {
    const { eventId, status, guestCount, notes } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check capacity
    if (event.capacity > 0 && event.rsvpCount >= event.capacity) {
      if (event.waitlistEnabled) {
        status = "waitlist";
      } else {
        return res.status(400).json({ message: "Event is at full capacity" });
      }
    }

    // Check if RSVP already exists
    let rsvp = await RSVP.findOne({ event: eventId, user: req.user._id });

    if (rsvp) {
      // Update existing RSVP
      const oldStatus = rsvp.status;
      rsvp.status = status;
      rsvp.guestCount = guestCount || rsvp.guestCount;
      rsvp.notes = notes || rsvp.notes;
      await rsvp.save();

      // Update event count
      if (oldStatus === "going" && status !== "going") {
        event.rsvpCount = Math.max(0, event.rsvpCount - 1);
      } else if (oldStatus !== "going" && status === "going") {
        event.rsvpCount += 1;
      }
    } else {
      // Create new RSVP
      rsvp = await RSVP.create({
        event: eventId,
        user: req.user._id,
        status,
        guestCount: guestCount || 1,
        notes,
      });

      if (status === "going") {
        event.rsvpCount += 1;
      }

      // Notify event creator
      await createNotification({
        recipient: event.user,
        sender: req.user._id,
        type: "event_interest",
        title: "New RSVP",
        message: `${req.user.name} RSVP'd to your event: ${event.title}`,
        link: `/events/${eventId}`,
      });
    }

    await event.save();
    await rsvp.populate("user", "name profilePicture");

    res.json({ rsvp, event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event RSVPs
export const getEventRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.eventId })
      .populate("user", "name profilePicture email")
      .sort({ createdAt: -1 });

    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's RSVPs
export const getMyRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check-in to event
export const checkIn = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({
      event: req.params.eventId,
      user: req.user._id,
    });

    if (!rsvp) {
      return res.status(404).json({ message: "RSVP not found" });
    }

    rsvp.checkedIn = true;
    rsvp.checkedInAt = new Date();
    await rsvp.save();

    res.json({ message: "Checked in successfully", rsvp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete RSVP
export const deleteRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findOneAndDelete({
      event: req.params.eventId,
      user: req.user._id,
    });

    if (!rsvp) {
      return res.status(404).json({ message: "RSVP not found" });
    }

    // Update event count
    if (rsvp.status === "going") {
      await Event.findByIdAndUpdate(req.params.eventId, {
        $inc: { rsvpCount: -1 },
      });
    }

    res.json({ message: "RSVP cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

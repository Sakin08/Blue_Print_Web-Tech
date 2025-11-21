import Event from "../models/Event.js";
import { uploadImage } from "../services/cloudinaryService.js";
import { createNotification } from "./notificationController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const createEvent = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, description, date, location } = req.body;

      if (!title || !description || !date || !location) {
        return res.status(400).json({ message: "All fields are required" });
      }

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      // Parse additional fields
      const capacity = req.body.capacity ? parseInt(req.body.capacity) : 0;
      const requiresRSVP = req.body.requiresRSVP === "true";
      const waitlistEnabled = req.body.waitlistEnabled === "true";
      const category = req.body.category || "other";

      const eventData = {
        title,
        description,
        date,
        location,
        images: imageUrls,
        user: req.user._id,
        capacity,
        requiresRSVP,
        waitlistEnabled,
        category,
      };

      // Parse coordinates if provided
      if (req.body.coordinates) {
        try {
          eventData.coordinates = JSON.parse(req.body.coordinates);
        } catch (e) {
          console.error("Failed to parse coordinates:", e);
        }
      }

      // Parse tags if provided
      if (req.body.tags) {
        try {
          eventData.tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.error("Failed to parse tags:", e);
        }
      }

      const event = await Event.create(eventData);

      await event.populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      );

      // Emit real-time event creation
      const io = req.app.get("io");
      if (io) {
        io.to("events").emit("eventUpdate", { type: "created", data: event });
      }

      res.status(201).json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("interested", "name")
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("interested", "name");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Get event by ID error:", error);
    res.status(500).json({ message: error.message });
  }
};
export const markInterested = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;
    const isInterested = event.interested.includes(userId);

    if (isInterested) {
      // Remove user from interested list
      event.interested = event.interested.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add user to interested list
      event.interested.push(userId);
    }

    await event.save();
    await event.populate(
      "user",
      "name email profilePicture department batch isStudentVerified"
    );
    await event.populate("interested", "name");

    // Emit real-time interest update
    const io = req.app.get("io");
    if (io) {
      io.to("events").emit("eventUpdate", {
        type: "interestUpdated",
        data: {
          eventId: event._id,
          interestedCount: event.interested.length,
          event: event,
        },
      });
    }

    res.json(event);
  } catch (error) {
    console.error("Interest update error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: "Event not found" });
      if (event.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const {
        title,
        description,
        date,
        location,
        capacity,
        requiresRSVP,
        waitlistEnabled,
        category,
        tags,
        coordinates,
        existingImages,
      } = req.body;

      // Parse existing images
      const parsedExistingImages = existingImages
        ? JSON.parse(existingImages)
        : event.images || [];

      // Handle new image uploads
      let newImageUrls = [];
      if (req.files && req.files.length > 0) {
        newImageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      // Combine existing and new images
      const allImages = [...parsedExistingImages, ...newImageUrls];

      // Update event data
      const updateData = {
        title: title || event.title,
        description: description || event.description,
        date: date || event.date,
        location: location || event.location,
        capacity: capacity !== undefined ? parseInt(capacity) : event.capacity,
        requiresRSVP:
          requiresRSVP !== undefined
            ? requiresRSVP === "true"
            : event.requiresRSVP,
        waitlistEnabled:
          waitlistEnabled !== undefined
            ? waitlistEnabled === "true"
            : event.waitlistEnabled,
        category: category || event.category,
        images: allImages,
      };

      // Parse coordinates if provided
      if (coordinates) {
        try {
          updateData.coordinates = JSON.parse(coordinates);
        } catch (e) {
          console.error("Failed to parse coordinates:", e);
        }
      }

      // Parse tags if provided
      if (tags) {
        try {
          updateData.tags = JSON.parse(tags);
        } catch (e) {
          console.error("Failed to parse tags:", e);
        }
      }

      Object.assign(event, updateData);
      await event.save();

      await event.populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      );

      // Emit real-time event update
      const io = req.app.get("io");
      if (io) {
        io.to("events").emit("eventUpdate", {
          type: "updated",
          data: event,
        });
      }

      res.json(event);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Allow admin or owner to delete
    const isOwner = event.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();

    // Emit real-time event deletion
    const io = req.app.get("io");
    if (io) {
      io.to("events").emit("eventUpdate", {
        type: "deleted",
        data: { eventId: event._id },
      });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: error.message });
  }
};

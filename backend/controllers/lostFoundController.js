import LostFound from "../models/LostFound.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const createLostFound = [
  upload.array("images", 3),
  async (req, res) => {
    try {
      const {
        title,
        description,
        type,
        category,
        location,
        date,
        contactInfo,
        color,
        brand,
        identifyingFeatures,
      } = req.body;

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      const item = await LostFound.create({
        title,
        description,
        type,
        category,
        location,
        date,
        contactInfo,
        color,
        brand,
        identifyingFeatures,
        images: imageUrls,
        poster: req.user._id,
      });

      await item.populate(
        "poster",
        "name email profilePicture department batch isStudentVerified"
      );

      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

export const getLostFoundItems = async (req, res) => {
  try {
    const { type, category, status } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status && status !== "all") filter.status = status;
    else if (!status) filter.status = "active"; // Default to active items if no status specified

    const items = await LostFound.find(filter)
      .populate(
        "poster",
        "name email profilePicture department batch isStudentVerified"
      )
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLostFoundById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate(
        "poster",
        "name email profilePicture department batch isStudentVerified"
      )
      .populate("claimedBy", "name email profilePicture");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.views = (item.views || 0) + 1;
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const claimItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status !== "active") {
      return res
        .status(400)
        .json({ message: "Item already claimed or resolved" });
    }

    item.status = "claimed";
    item.claimedBy = req.user._id;
    await item.save();
    await item.populate(
      "poster",
      "name email profilePicture department batch isStudentVerified"
    );
    await item.populate("claimedBy", "name email profilePicture");

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.status = status;
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLostFound = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Allow admin or owner to delete
    const isOwner = item.poster.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

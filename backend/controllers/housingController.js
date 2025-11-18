import HousingPost from "../models/HousingPost.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const createHousing = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        postType,
        housingType,
        title,
        location,
        address,
        coordinates,
        rent,
        maxBudget,
        availableFrom,
        totalSeats,
        availableSeats,
        totalRooms,
        genderPreference,
        preferredTenant,
        facilities,
        floorNumber,
        distanceFromCampus,
        advanceDeposit,
        negotiable,
        utilitiesIncluded,
        description,
        phone,
        preferredContact,
      } = req.body;

      // Parse JSON fields
      const parsedFacilities = facilities ? JSON.parse(facilities) : [];

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      const postData = {
        postType,
        housingType,
        title,
        location,
        address,
        rent: postType === "available" ? rent : maxBudget,
        availableFrom,
        genderPreference,
        preferredTenant,
        facilities: parsedFacilities,
        description,
        phone,
        preferredContact,
        images: imageUrls,
        user: req.user._id,
      };

      // Add optional fields
      if (totalSeats) postData.totalSeats = totalSeats;
      if (availableSeats) postData.availableSeats = availableSeats;
      if (totalRooms) postData.totalRooms = totalRooms;
      if (floorNumber) postData.floorNumber = floorNumber;
      if (distanceFromCampus) postData.distanceFromCampus = distanceFromCampus;
      if (advanceDeposit) postData.advanceDeposit = advanceDeposit;
      if (negotiable !== undefined) postData.negotiable = negotiable === "true";
      if (utilitiesIncluded !== undefined)
        postData.utilitiesIncluded = utilitiesIncluded === "true";

      const post = await HousingPost.create(postData);

      await post.populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      );

      res.status(201).json(post);
    } catch (error) {
      console.error("Housing creation error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

export const getHousings = async (req, res) => {
  const posts = await HousingPost.find()
    .sort({ createdAt: -1 }) // Sort by most recent first
    .populate(
      "user",
      "name email phone profilePicture department batch isStudentVerified"
    );
  res.json(posts);
};

export const getHousingById = async (req, res) => {
  try {
    const post = await HousingPost.findById(req.params.id).populate(
      "user",
      "name email phone profilePicture department batch isStudentVerified"
    );

    if (!post) {
      return res.status(404).json({ message: "Housing post not found" });
    }

    // Increment view count without validation
    await HousingPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { runValidators: false }
    );

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHousing = async (req, res) => {
  const post = await HousingPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });
  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  Object.assign(post, req.body);
  await post.save();
  res.json(post);
};

export const deleteHousing = async (req, res) => {
  const post = await HousingPost.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });

  // Allow admin or owner to delete
  const isOwner = post.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await post.deleteOne();
  res.json({ message: "Deleted" });
};

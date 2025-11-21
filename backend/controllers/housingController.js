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

export const updateHousing = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const post = await HousingPost.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Not found" });
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const {
        postType,
        housingType,
        title,
        location,
        address,
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
        existingImages,
      } = req.body;

      // Parse JSON fields
      const parsedFacilities = facilities
        ? JSON.parse(facilities)
        : post.facilities;
      const parsedExistingImages = existingImages
        ? JSON.parse(existingImages)
        : post.images;

      // Handle new image uploads
      let newImageUrls = [];
      if (req.files && req.files.length > 0) {
        newImageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      // Combine existing and new images
      const allImages = [...parsedExistingImages, ...newImageUrls];

      // Update post data
      const updateData = {
        postType: postType || post.postType,
        housingType: housingType || post.housingType,
        title: title || post.title,
        location: location || post.location,
        address: address || post.address,
        rent:
          postType === "available" ? rent || post.rent : maxBudget || post.rent,
        availableFrom: availableFrom || post.availableFrom,
        genderPreference: genderPreference || post.genderPreference,
        preferredTenant: preferredTenant || post.preferredTenant,
        facilities: parsedFacilities,
        description: description || post.description,
        phone: phone || post.phone,
        preferredContact: preferredContact || post.preferredContact,
        images: allImages,
      };

      // Add optional fields
      if (totalSeats !== undefined) updateData.totalSeats = totalSeats;
      if (availableSeats !== undefined)
        updateData.availableSeats = availableSeats;
      if (totalRooms !== undefined) updateData.totalRooms = totalRooms;
      if (floorNumber !== undefined) updateData.floorNumber = floorNumber;
      if (distanceFromCampus !== undefined)
        updateData.distanceFromCampus = distanceFromCampus;
      if (advanceDeposit !== undefined)
        updateData.advanceDeposit = advanceDeposit;
      if (negotiable !== undefined)
        updateData.negotiable = negotiable === "true" || negotiable === true;
      if (utilitiesIncluded !== undefined)
        updateData.utilitiesIncluded =
          utilitiesIncluded === "true" || utilitiesIncluded === true;

      Object.assign(post, updateData);
      await post.save();

      await post.populate(
        "user",
        "name email profilePicture department batch isStudentVerified"
      );

      res.json(post);
    } catch (error) {
      console.error("Housing update error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

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

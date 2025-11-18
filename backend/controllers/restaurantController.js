import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Create restaurant (shop owner only)
export const createRestaurant = [
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      // Any logged-in user can create a restaurant
      // They automatically become a shop owner
      // Auto-verify for now (no admin approval needed initially)

      const {
        name,
        description,
        shopType,
        location,
        address,
        coordinates,
        phone,
        email,
        openingTime,
        closingTime,
        deliveryAvailable,
        deliveryFee,
        minimumOrder,
        estimatedDeliveryTime,
        paymentMethods,
        features,
      } = req.body;

      // Upload images
      let logoUrl = null;
      let coverImageUrl = null;
      let imageUrls = [];

      if (req.files.logo) {
        logoUrl = await uploadImage(req.files.logo[0]);
      }
      if (req.files.coverImage) {
        coverImageUrl = await uploadImage(req.files.coverImage[0]);
      }
      if (req.files.images) {
        imageUrls = await Promise.all(
          req.files.images.map((file) => uploadImage(file))
        );
      }

      const restaurantData = {
        name,
        shopType,
        location,
        phone,
        openingTime,
        closingTime,
        owner: req.user._id,
        logo: logoUrl,
        coverImage: coverImageUrl,
        images: imageUrls,
        paymentMethods: paymentMethods ? JSON.parse(paymentMethods) : ["cash"],
        features: features ? JSON.parse(features) : [],
      };

      // Add optional fields
      if (description) restaurantData.description = description;
      if (address) restaurantData.address = address;
      if (email) restaurantData.email = email;
      if (deliveryAvailable !== undefined)
        restaurantData.deliveryAvailable = deliveryAvailable === "true";
      if (deliveryFee) restaurantData.deliveryFee = deliveryFee;
      if (minimumOrder) restaurantData.minimumOrder = minimumOrder;
      if (estimatedDeliveryTime)
        restaurantData.estimatedDeliveryTime = estimatedDeliveryTime;

      // Auto-verify restaurant (no admin approval needed for now)
      restaurantData.isVerified = true;
      restaurantData.verifiedAt = new Date();

      const restaurant = await Restaurant.create(restaurantData);

      // Don't change user role - students remain students even if they own a shop
      // Ownership is determined by the 'owner' field, not by role

      await restaurant.populate("owner", "name email phone");

      res.status(201).json(restaurant);
    } catch (error) {
      console.error("Restaurant creation error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Get all restaurants (with filters)
export const getRestaurants = async (req, res) => {
  try {
    const { shopType, isVerified, isOpen, search } = req.query;

    let query = { isActive: true };

    if (shopType) query.shopType = shopType;
    if (isVerified) query.isVerified = isVerified === "true";
    if (isOpen) query.isOpen = isOpen === "true";
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const restaurants = await Restaurant.find(query)
      .populate("owner", "name email phone")
      .sort({ isVerified: -1, rating: -1, createdAt: -1 });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single restaurant with menu
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get menu items
    const menuItems = await MenuItem.find({ restaurant: req.params.id }).sort({
      category: 1,
      name: 1,
    });

    // Increment view count
    restaurant.views = (restaurant.views || 0) + 1;
    await restaurant.save();

    res.json({ restaurant, menuItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update restaurant (owner only)
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check ownership
    if (
      restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify restaurant (admin only)
export const verifyRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can verify restaurants" });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    restaurant.isVerified = true;
    restaurant.verifiedAt = new Date();
    restaurant.verifiedBy = req.user._id;
    await restaurant.save();

    res.json({ message: "Restaurant verified successfully", restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (
      restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete all menu items
    await MenuItem.deleteMany({ restaurant: req.params.id });

    await restaurant.deleteOne();
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get restaurants by owner
export const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

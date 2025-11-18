import FoodMenu from "../models/FoodMenu.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Create food menu/vendor
export const createFoodMenu = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        vendorName,
        vendorType,
        location,
        department,
        hallName,
        menuItems,
        todaySpecial,
        notice,
        openingTime,
        closingTime,
        isOpen,
        phone,
        averageCost,
        features,
      } = req.body;

      // Parse JSON fields
      const parsedMenuItems = menuItems ? JSON.parse(menuItems) : [];
      const parsedFeatures = features ? JSON.parse(features) : [];

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      const menuData = {
        vendorName,
        vendorType,
        location,
        menuItems: parsedMenuItems,
        openingTime,
        closingTime,
        phone,
        features: parsedFeatures,
        images: imageUrls,
        coverImage: imageUrls[0] || null,
        postedBy: req.user._id,
      };

      // Add optional fields
      if (department) menuData.department = department;
      if (hallName) menuData.hallName = hallName;
      if (todaySpecial) menuData.todaySpecial = todaySpecial;
      if (notice) menuData.notice = notice;
      if (isOpen !== undefined) menuData.isOpen = isOpen === "true";
      if (averageCost) menuData.averageCost = averageCost;

      const menu = await FoodMenu.create(menuData);
      await menu.populate("postedBy", "name email profilePicture");

      res.status(201).json(menu);
    } catch (error) {
      console.error("Food menu creation error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Get all food menus with filters
export const getFoodMenus = async (req, res) => {
  try {
    const { vendorType, location, isOpen, search } = req.query;

    let query = {};

    if (vendorType) query.vendorType = vendorType;
    if (location) query.location = new RegExp(location, "i");
    if (isOpen) query.isOpen = isOpen === "true";
    if (search) {
      query.$or = [
        { vendorName: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
        { todaySpecial: new RegExp(search, "i") },
      ];
    }

    const menus = await FoodMenu.find(query)
      .populate("postedBy", "name email profilePicture")
      .sort({ isVerified: -1, rating: -1, createdAt: -1 });

    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single food menu by ID
export const getFoodMenuById = async (req, res) => {
  try {
    const menu = await FoodMenu.findById(req.params.id).populate(
      "postedBy",
      "name email phone profilePicture"
    );

    if (!menu) {
      return res.status(404).json({ message: "Food menu not found" });
    }

    // Increment view count
    menu.views = (menu.views || 0) + 1;
    await menu.save();

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update food menu
export const updateFoodMenu = async (req, res) => {
  try {
    const menu = await FoodMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(menu, req.body);
    await menu.save();

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food menu
export const deleteFoodMenu = async (req, res) => {
  try {
    const menu = await FoodMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await menu.deleteOne();
    res.json({ message: "Menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu item availability
export const updateMenuItemAvailability = async (req, res) => {
  try {
    const { itemId, available } = req.body;
    const menu = await FoodMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const item = menu.menuItems.id(itemId);
    if (item) {
      item.available = available;
      await menu.save();
      res.json(menu);
    } else {
      res.status(404).json({ message: "Menu item not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add rating/review
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const menu = await FoodMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Calculate new average rating
    const totalRating = menu.rating * menu.totalReviews + rating;
    menu.totalReviews += 1;
    menu.rating = totalRating / menu.totalReviews;

    await menu.save();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

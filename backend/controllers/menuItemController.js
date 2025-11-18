import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Create menu item (restaurant owner only)
export const createMenuItem = [
  upload.single("image"),
  async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.body.restaurant);

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Check if user owns the restaurant
      if (
        restaurant.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const {
        name,
        description,
        price,
        discountPrice,
        category,
        cuisine,
        isVegetarian,
        isVegan,
        spiceLevel,
        available,
        isSpecial,
        isBestSeller,
        isNew,
      } = req.body;

      let imageUrl = null;
      if (req.file) {
        imageUrl = await uploadImage(req.file);
      }

      const menuItemData = {
        restaurant: req.body.restaurant,
        name,
        price,
        category,
        image: imageUrl,
      };

      // Add optional fields
      if (description) menuItemData.description = description;
      if (discountPrice) menuItemData.discountPrice = discountPrice;
      if (cuisine) menuItemData.cuisine = cuisine;
      if (isVegetarian !== undefined)
        menuItemData.isVegetarian = isVegetarian === "true";
      if (isVegan !== undefined) menuItemData.isVegan = isVegan === "true";
      if (spiceLevel) menuItemData.spiceLevel = spiceLevel;
      if (available !== undefined)
        menuItemData.available = available === "true";
      if (isSpecial !== undefined)
        menuItemData.isSpecial = isSpecial === "true";
      if (isBestSeller !== undefined)
        menuItemData.isBestSeller = isBestSeller === "true";
      if (isNew !== undefined) menuItemData.isNew = isNew === "true";

      const menuItem = await MenuItem.create(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Menu item creation error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Get menu items by restaurant
export const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.restaurantId,
    }).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "restaurant"
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if user owns the restaurant
    if (
      menuItem.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(menuItem, req.body);
    await menuItem.save();

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle menu item availability
export const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "restaurant"
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if user owns the restaurant
    if (
      menuItem.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    menuItem.available = !menuItem.available;
    await menuItem.save();

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "restaurant"
    );

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Check if user owns the restaurant
    if (
      menuItem.restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import QuickMenu from "../models/QuickMenu.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Get all quick menus (sorted by date, newest first)
export const getAllQuickMenus = async (req, res) => {
  try {
    const { search, date } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Date filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const menus = await QuickMenu.find(query)
      .populate("postedBy", "name email role")
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    res.json(menus);
  } catch (error) {
    console.error("Get quick menus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single quick menu
export const getQuickMenuById = async (req, res) => {
  try {
    const menu = await QuickMenu.findById(req.params.id).populate(
      "postedBy",
      "name email phone role"
    );

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Increment views
    menu.views += 1;
    await menu.save();

    res.json(menu);
  } catch (error) {
    console.error("Get quick menu error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create quick menu post
export const createQuickMenu = [
  upload.array("images", 5), // Allow up to 5 images
  async (req, res) => {
    try {
      const {
        restaurantName,
        date,
        mealType,
        menuItems,
        contactNumber,
        location,
      } = req.body;

      // Validate required fields
      if (!restaurantName || !contactNumber || !location) {
        return res.status(400).json({
          message: "Restaurant name, contact number, and location are required",
        });
      }

      // Upload images
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
      }

      // Validate: at least one of images or menuItems must be provided
      if (imageUrls.length === 0 && (!menuItems || menuItems.trim() === "")) {
        return res.status(400).json({
          message: "At least one image or menu items text must be provided",
        });
      }

      const menu = new QuickMenu({
        restaurantName,
        date: date || new Date(),
        images: imageUrls,
        mealType: mealType || "lunch",
        menuItems: menuItems || "",
        contactNumber,
        location,
        postedBy: req.user._id,
      });

      await menu.save();

      const populatedMenu = await QuickMenu.findById(menu._id).populate(
        "postedBy",
        "name email"
      );

      res.status(201).json(populatedMenu);
    } catch (error) {
      console.error("Create quick menu error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Update quick menu
export const updateQuickMenu = [
  upload.array("images", 5),
  async (req, res) => {
    try {
      const menu = await QuickMenu.findById(req.params.id);

      if (!menu) {
        return res.status(404).json({ message: "Menu not found" });
      }

      // Check ownership
      if (
        menu.postedBy.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this menu" });
      }

      const {
        restaurantName,
        date,
        mealType,
        menuItems,
        contactNumber,
        location,
      } = req.body;

      // Update fields
      if (restaurantName) menu.restaurantName = restaurantName;
      if (date) menu.date = date;
      if (mealType) menu.mealType = mealType;
      if (menuItems !== undefined) menu.menuItems = menuItems;
      if (contactNumber) menu.contactNumber = contactNumber;
      if (location) menu.location = location;

      // Update images if provided
      if (req.files && req.files.length > 0) {
        const imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file))
        );
        menu.images = imageUrls;
      }

      await menu.save();

      const updatedMenu = await QuickMenu.findById(menu._id).populate(
        "postedBy",
        "name email"
      );

      res.json(updatedMenu);
    } catch (error) {
      console.error("Update quick menu error:", error);
      res.status(500).json({ message: error.message });
    }
  },
];

// Delete quick menu
export const deleteQuickMenu = async (req, res) => {
  try {
    const menu = await QuickMenu.findById(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    // Check ownership
    if (
      menu.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this menu" });
    }

    await menu.deleteOne();
    res.json({ message: "Menu deleted successfully" });
  } catch (error) {
    console.error("Delete quick menu error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get today's menus
export const getTodayMenus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menus = await QuickMenu.find({
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(menus);
  } catch (error) {
    console.error("Get today's menus error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get my posted menus
export const getMyMenus = async (req, res) => {
  try {
    const menus = await QuickMenu.find({ postedBy: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(50);

    res.json(menus);
  } catch (error) {
    console.error("Get my menus error:", error);
    res.status(500).json({ message: error.message });
  }
};

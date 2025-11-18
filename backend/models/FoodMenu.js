import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
  category: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snacks", "beverages"],
    required: true,
  },
  description: { type: String },
  isSpecial: { type: Boolean, default: false }, // Today's special
  image: { type: String },
});

const foodMenuSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true },
    vendorType: {
      type: String,
      enum: [
        "canteen",
        "department-cafe",
        "gate-shop",
        "hall-mess",
        "restaurant",
      ],
      required: true,
    },
    location: { type: String, required: true }, // e.g., "TSC Canteen", "CSE Dept Cafe", "Main Gate"
    department: { type: String }, // For department cafes
    hallName: { type: String }, // For hall mess

    // Menu items
    menuItems: [menuItemSchema],

    // Daily special or notice
    todaySpecial: { type: String },
    notice: { type: String }, // e.g., "Closed for maintenance"

    // Timing
    openingTime: { type: String }, // e.g., "8:00 AM"
    closingTime: { type: String }, // e.g., "10:00 PM"
    isOpen: { type: Boolean, default: true },

    // Contact & Details
    phone: { type: String },
    averageCost: { type: Number }, // Average meal cost

    // Ratings & Reviews
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Features
    features: [
      {
        type: String,
        enum: [
          "wifi",
          "ac",
          "outdoor-seating",
          "home-delivery",
          "takeaway",
          "card-payment",
          "bkash",
        ],
      },
    ],

    // Images
    images: [{ type: String }],
    coverImage: { type: String },

    // Posted by (admin or verified user)
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Verification
    isVerified: { type: Boolean, default: false },

    // Stats
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for search
foodMenuSchema.index({
  vendorName: "text",
  location: "text",
  todaySpecial: "text",
});

export default mongoose.model("FoodMenu", foodMenuSchema);

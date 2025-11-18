import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    // Shop Type
    shopType: {
      type: String,
      enum: [
        "restaurant",
        "canteen",
        "cafe",
        "fast-food",
        "bakery",
        "juice-bar",
      ],
      required: true,
    },

    // Location
    location: { type: String, required: true },
    address: { type: String },

    // Contact
    phone: { type: String, required: true },
    email: { type: String },

    // Timing
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    isOpen: { type: Boolean, default: true },

    // Delivery
    deliveryAvailable: { type: Boolean, default: true },
    deliveryFee: { type: Number, default: 0 },
    minimumOrder: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: String, default: "30-45 mins" },

    // Payment Methods
    paymentMethods: [
      {
        type: String,
        enum: ["cash", "bkash", "nagad", "rocket", "card"],
      },
    ],

    // Images
    logo: { type: String },
    coverImage: { type: String },
    images: [{ type: String }],

    // Ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },

    // Owner (verified shop owner)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Verification by admin
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Status
    isActive: { type: Boolean, default: true },

    // Features
    features: [
      {
        type: String,
        enum: ["wifi", "ac", "outdoor-seating", "parking", "card-payment"],
      },
    ],

    // Stats
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: "text", location: "text", description: "text" });

export default mongoose.model("Restaurant", restaurantSchema);

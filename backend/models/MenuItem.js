import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: { type: String, required: true },
    description: { type: String },

    // Pricing
    price: { type: Number, required: true },
    discountPrice: { type: Number },

    // Category
    category: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snacks",
        "beverages",
        "desserts",
        "main-course",
        "appetizers",
      ],
      required: true,
    },

    // Cuisine type
    cuisine: {
      type: String,
      enum: [
        "bengali",
        "chinese",
        "indian",
        "fast-food",
        "continental",
        "thai",
        "italian",
        "mixed",
      ],
    },

    // Dietary
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    spiceLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra-hot"],
      default: "medium",
    },

    // Availability
    available: { type: Boolean, default: true },

    // Special tags
    isSpecial: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },

    // Image
    image: { type: String },

    // Stats
    orderCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ name: "text", description: "text" });

export default mongoose.model("MenuItem", menuItemSchema);

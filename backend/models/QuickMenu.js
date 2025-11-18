import mongoose from "mongoose";

const quickMenuSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    images: {
      type: [String],
      default: [],
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks", "special"],
      default: "lunch",
    },
    menuItems: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search
quickMenuSchema.index({
  restaurantName: "text",
  location: "text",
  menuItems: "text",
  mealType: 1,
});

// Index for date queries
quickMenuSchema.index({ date: -1 });

// Custom validation: at least one of images or menuItems must be provided
quickMenuSchema.pre("save", function (next) {
  if (
    (!this.images || this.images.length === 0) &&
    (!this.menuItems || this.menuItems.trim() === "")
  ) {
    next(new Error("At least one image or menu items text must be provided"));
  } else {
    next();
  }
});

export default mongoose.model("QuickMenu", quickMenuSchema);

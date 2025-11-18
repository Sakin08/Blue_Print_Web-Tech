import mongoose from "mongoose";

const housingPostSchema = new mongoose.Schema(
  {
    // Post Type
    postType: {
      type: String,
      enum: ["available", "looking"],
      required: true,
    }, // available = offering, looking = searching

    housingType: {
      type: String,
      enum: ["seat", "room", "flat"],
      required: true,
    },

    // Basic Info
    title: { type: String, required: true },
    location: { type: String, required: true }, // Area name (Kumargaon, Shahjalal Upashahar, etc.)
    address: { type: String, required: true }, // Full address
    rent: { type: Number, required: true },
    availableFrom: { type: Date, required: true },

    // Capacity
    totalSeats: { type: Number }, // For seat/room posts
    availableSeats: { type: Number }, // How many seats available
    totalRooms: { type: Number }, // For flat posts

    // Preferences
    genderPreference: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },
    preferredTenant: {
      type: String,
      enum: ["student", "professional", "family", "any"],
      default: "student",
    },

    // Facilities
    facilities: [
      {
        type: String,
        enum: [
          "attached_bath",
          "wifi",
          "gas_line",
          "gas_cylinder",
          "generator",
          "parking",
          "lift",
          "security",
          "house_maid",
          "furnished",
          "balcony",
          "kitchen",
        ],
      },
    ],

    // Building Info
    floorNumber: { type: String },
    distanceFromCampus: { type: String }, // e.g., "5 min walk", "2 km"

    // Financial
    advanceDeposit: { type: Number },
    negotiable: { type: Boolean, default: false },
    utilitiesIncluded: { type: Boolean, default: false },

    // Description
    description: { type: String, required: true },

    // Contact
    phone: { type: String, required: true },
    preferredContact: {
      type: String,
      enum: ["phone", "message", "both"],
      default: "both",
    },

    // Media
    images: [{ type: String }],

    // Status
    status: {
      type: String,
      enum: ["active", "rented", "closed"],
      default: "active",
    },

    // Meta
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for search
housingPostSchema.index({
  location: 1,
  housingType: 1,
  postType: 1,
  status: 1,
});
housingPostSchema.index({ rent: 1 });
housingPostSchema.index({ availableFrom: 1 });

export default mongoose.model("HousingPost", housingPostSchema);

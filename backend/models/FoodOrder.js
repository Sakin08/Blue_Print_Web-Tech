import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String },
});

const foodOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },

    // Customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Restaurant
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // Order Items
    items: [orderItemSchema],

    // Pricing
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Delivery Details
    deliveryAddress: { type: String, required: true },
    deliveryLocation: { type: String }, // e.g., "Shahjalal Hall, Room 301"
    phone: { type: String, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cash", "bkash", "nagad", "rocket", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: { type: String },

    // Order Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "on-the-way",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // Timestamps for tracking
    confirmedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },

    // Cancellation
    cancellationReason: { type: String },
    cancelledBy: {
      type: String,
      enum: ["customer", "restaurant", "admin"],
    },

    // Special Instructions
    specialInstructions: { type: String },

    // Rating & Review (after delivery)
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Generate order number
foodOrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("FoodOrder").countDocuments();
    this.orderNumber = `ORD${Date.now()}${count + 1}`;
  }
  next();
});

export default mongoose.model("FoodOrder", foodOrderSchema);

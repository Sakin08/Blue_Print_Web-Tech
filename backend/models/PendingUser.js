import mongoose from "mongoose";

// Temporary storage for users pending OTP verification
const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    department: { type: String, required: true },
    batch: { type: String, required: true },
    phone: { type: String },
    password: { type: String, required: true }, // Hashed password
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Auto-delete after 1 hour
  },
  { timestamps: true }
);

// Index for automatic cleanup
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("PendingUser", pendingUserSchema);

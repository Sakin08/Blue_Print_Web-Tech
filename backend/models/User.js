import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // MANDATORY FIELDS (Required at registration)
    // ========================================
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "other", "admin"],
      default: "student",
      required: true,
    },
    department: { type: String, default: "N/A" },
    registrationNumber: { type: String, default: "N/A" }, // Required for students only
    batch: { type: String, default: "N/A" }, // Auto-extracted for students

    // ========================================
    // OPTIONAL / EDITABLE FIELDS
    // ========================================
    profilePicture: { type: String, default: "" },
    username: { type: String, unique: true, sparse: true }, // Display name
    phone: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    dateOfBirth: { type: Date },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      facebook: { type: String },
    },
    address: {
      street: { type: String },
      city: { type: String },
      district: { type: String },
      country: { type: String, default: "Bangladesh" },
    },
    dormInfo: {
      dormName: { type: String },
      roomNumber: { type: String },
    },
    bio: { type: String, default: "", maxlength: 500 },
    interests: [{ type: String }],
    coursesEnrolled: [{ type: String }], // For students
    coursesTaught: [{ type: String }], // For teachers
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        date: { type: Date },
      },
    ],

    // ========================================
    // SYSTEM / READ-ONLY FIELDS
    // ========================================
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    lastActive: { type: Date, default: Date.now },
    accountCreatedAt: { type: Date, default: Date.now },

    // Social Features
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, required: true },
        postType: {
          type: String,
          enum: [
            "housing",
            "buysell",
            "event",
            "studygroup",
            "job",
            "food",
            "lostfound",
          ],
          required: true,
        },
        savedAt: { type: Date, default: Date.now },
      },
    ],

    // Verification & Safety
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    studentId: { type: String },
    isStudentVerified: { type: Boolean, default: false },

    // OTP Verification
    otp: { type: String },
    otpExpiry: { type: Date },
    otpVerified: { type: Boolean, default: false },

    // Admin Approval System
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalNote: { type: String },

    // Reputation
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reputationPoints: { type: Number, default: 0 },
    badges: [{ type: String }],

    // Safety
    reportedCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },

    // System Admin (Super Admin) - Cannot be modified by other admins
    isSystemAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

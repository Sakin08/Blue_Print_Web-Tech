// Script to create first admin user
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = process.argv[2] || "admin@sust.edu";
    const adminPassword = process.argv[3] || "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);

      // Update to admin if not already
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        existingAdmin.isApproved = true;
        await existingAdmin.save();
        console.log("✅ User updated to admin role");
      }

      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      department: "Administration",
      registrationNumber: "ADMIN001",
      batch: "2024",
      isApproved: true,
      approvedAt: new Date(),
      otpVerified: true,
      isStudentVerified: true,
      emailVerified: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

console.log("Creating admin user...");
console.log("Usage: node createAdmin.js [email] [password]");
console.log("Example: node createAdmin.js admin@sust.edu mypassword\n");

createAdmin();

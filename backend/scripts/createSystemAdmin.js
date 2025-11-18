import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const createSystemAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const systemAdminEmail = "admin@sustconnect.com";

    // Check if system admin already exists
    let systemAdmin = await User.findOne({ email: systemAdminEmail });

    if (systemAdmin) {
      console.log("System admin already exists. Updating...");

      // Remove system admin flag from all other users
      await User.updateMany(
        { isSystemAdmin: true, email: { $ne: systemAdminEmail } },
        { isSystemAdmin: false }
      );

      // Update existing user
      systemAdmin.isSystemAdmin = true;
      systemAdmin.role = "admin";
      systemAdmin.isApproved = true;
      await systemAdmin.save();

      console.log(
        `✅ ${systemAdmin.name} (${systemAdmin.email}) is now the System Administrator`
      );
    } else {
      console.log("Creating new system admin...");

      // Remove system admin flag from all users
      await User.updateMany({ isSystemAdmin: true }, { isSystemAdmin: false });

      // Create new system admin
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      systemAdmin = await User.create({
        name: "System Administrator",
        email: systemAdminEmail,
        password: hashedPassword,
        role: "admin",
        department: "Administration",
        registrationNumber: "ADMIN-001",
        batch: "N/A",
        isApproved: true,
        isSystemAdmin: true,
        emailVerified: true,
        otpVerified: true,
      });

      console.log("✅ System Administrator created successfully!");
      console.log("");
      console.log("📧 Email: admin@sustconnect.com");
      console.log("🔑 Password: Admin@123");
      console.log("");
      console.log(
        "⚠️  IMPORTANT: Please change the password after first login!"
      );
    }

    console.log("");
    console.log("System Admin Privileges:");
    console.log("   ✓ Cannot be banned");
    console.log("   ✓ Cannot be deleted");
    console.log("   ✓ Cannot have role changed");
    console.log("   ✓ Has full system access");
    console.log("   ✓ Can manage all other admins");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createSystemAdmin();

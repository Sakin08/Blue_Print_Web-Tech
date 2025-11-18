import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const setSystemAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Remove system admin from all other users
    await User.updateMany({ isSystemAdmin: true }, { isSystemAdmin: false });

    // Set this user as system admin
    user.isSystemAdmin = true;
    user.role = "admin";
    user.isApproved = true;
    await user.save();

    console.log(
      `✅ ${user.name} (${user.email}) is now the System Administrator`
    );
    console.log("   - Cannot be banned");
    console.log("   - Cannot be deleted");
    console.log("   - Cannot have role changed");
    console.log("   - Has full system access");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("Usage: node setSystemAdmin.js <email>");
  console.error("Example: node setSystemAdmin.js admin@student.sust.edu");
  process.exit(1);
}

setSystemAdmin(email);

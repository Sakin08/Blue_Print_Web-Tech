// Script to fix users with 'shop-owner' role
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const fixUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all users with 'shop-owner' role
    const shopOwners = await User.find({ role: "shop-owner" });
    console.log(`Found ${shopOwners.length} users with 'shop-owner' role`);

    // Update each user
    for (const user of shopOwners) {
      // Determine correct role based on email
      let newRole = "student";

      if (user.email.includes("@student.sust.edu")) {
        newRole = "student";
      } else if (user.email.includes("@sust.edu")) {
        // Could be teacher or staff - default to teacher
        newRole = "teacher";
      }

      console.log(`Updating ${user.email}: shop-owner → ${newRole}`);

      // Update directly in database to bypass validation
      await User.updateOne({ _id: user._id }, { $set: { role: newRole } });
    }

    console.log("✅ All users updated successfully!");
    console.log("You can now login again.");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixUserRoles();

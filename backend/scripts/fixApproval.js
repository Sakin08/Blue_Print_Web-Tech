import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected\n");

  // Get all users
  const users = await User.find();

  let count = 0;
  for (const user of users) {
    if (
      user.email.includes("@student.sust.edu") ||
      user.email.includes("@teacher.sust.edu")
    ) {
      if (!user.isApproved) {
        user.isApproved = true;
        user.approvedAt = new Date();
        await user.save();
        console.log("✅ Approved:", user.email);
        count++;
      }
    }
  }

  console.log(`\nTotal approved: ${count}`);
  process.exit(0);
});

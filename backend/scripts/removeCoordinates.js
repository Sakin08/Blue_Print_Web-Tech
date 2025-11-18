import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import HousingPost from "../models/HousingPost.js";
import BuySellPost from "../models/BuySellPost.js";
import Restaurant from "../models/Restaurant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const removeCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Remove coordinates from HousingPost
    const housingResult = await HousingPost.updateMany(
      {},
      { $unset: { coordinates: "" } }
    );
    console.log(`Updated ${housingResult.modifiedCount} housing posts`);

    // Remove coordinates from BuySellPost
    const buySellResult = await BuySellPost.updateMany(
      {},
      { $unset: { coordinates: "" } }
    );
    console.log(`Updated ${buySellResult.modifiedCount} buy/sell posts`);

    // Remove coordinates from Restaurant
    const restaurantResult = await Restaurant.updateMany(
      {},
      { $unset: { coordinates: "" } }
    );
    console.log(`Updated ${restaurantResult.modifiedCount} restaurants`);

    console.log("✅ Successfully removed coordinates from all collections");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

removeCoordinates();

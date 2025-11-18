import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const fixInvalidPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const housingCollection = db.collection("housingposts");

    // Find posts missing required fields
    const invalidPosts = await housingCollection
      .find({
        $or: [
          { postType: { $exists: false } },
          { availableFrom: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`Found ${invalidPosts.length} invalid housing posts`);

    if (invalidPosts.length > 0) {
      // Delete invalid posts
      const result = await housingCollection.deleteMany({
        $or: [
          { postType: { $exists: false } },
          { availableFrom: { $exists: false } },
        ],
      });

      console.log(`Deleted ${result.deletedCount} invalid housing posts`);
    }

    console.log("✅ Successfully cleaned up invalid posts");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixInvalidPosts();

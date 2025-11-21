import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const removeUsernameUniqueIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Get all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    // Drop the username unique index if it exists
    try {
      await collection.dropIndex("username_1");
      console.log("Successfully dropped username_1 index");
    } catch (err) {
      console.log("Index username_1 does not exist or already dropped");
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

removeUsernameUniqueIndex();

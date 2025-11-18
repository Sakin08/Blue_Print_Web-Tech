import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "../models/Post.js";
import HousingPost from "../models/HousingPost.js";
import BuySellPost from "../models/BuySellPost.js";
import Event from "../models/Event.js";
import Job from "../models/Job.js";
import FoodOrder from "../models/FoodOrder.js";
import StudyGroup from "../models/StudyGroup.js";
import LostFound from "../models/LostFound.js";
import BloodRequest from "../models/BloodRequest.js";

dotenv.config();

const migrateExistingPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Migrate Housing Posts
    const housingPosts = await HousingPost.find().populate("user");
    for (const housing of housingPosts) {
      const existingPost = await Post.findOne({
        "relatedContent.contentId": housing._id,
      });
      if (!existingPost) {
        await Post.create({
          author: housing.user._id,
          type: "housing",
          content: {
            text: `Posted a housing listing: ${housing.address}\nRent: ৳${
              housing.rent
            }/month\nRoommates needed: ${
              housing.roommatesNeeded
            }\n${housing.description.substring(0, 150)}${
              housing.description.length > 150 ? "..." : ""
            }`,
            images: housing.images || [],
          },
          relatedContent: {
            contentType: "HousingPost",
            contentId: housing._id,
          },
          visibility: "public",
          createdAt: housing.createdAt,
          updatedAt: housing.updatedAt,
        });
        console.log(`Created newsfeed post for housing: ${housing.address}`);
      }
    }

    // Migrate Buy/Sell Posts
    const buysellPosts = await BuySellPost.find().populate("user");
    for (const item of buysellPosts) {
      const existingPost = await Post.findOne({
        "relatedContent.contentId": item._id,
      });
      if (!existingPost) {
        await Post.create({
          author: item.user._id,
          type: "buysell",
          content: {
            text: `Posted an item for sale: ${item.title}\nPrice: ৳${
              item.price
            }\nLocation: ${item.location}\n${item.description.substring(
              0,
              150
            )}${item.description.length > 150 ? "..." : ""}`,
            images: item.images || [],
          },
          relatedContent: {
            contentType: "BuySellPost",
            contentId: item._id,
          },
          visibility: "public",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
        console.log(`Created newsfeed post for item: ${item.title}`);
      }
    }

    // Migrate Events
    const events = await Event.find().populate("user");
    for (const event of events) {
      const existingPost = await Post.findOne({
        "relatedContent.contentId": event._id,
      });
      if (!existingPost) {
        await Post.create({
          author: event.user._id,
          type: "event",
          content: {
            text: `Created a new event: ${
              event.title
            }\n${event.description.substring(0, 200)}${
              event.description.length > 200 ? "..." : ""
            }`,
            images: event.images || [],
          },
          relatedContent: {
            contentType: "Event",
            contentId: event._id,
          },
          visibility: "public",
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        });
        console.log(`Created newsfeed post for event: ${event.title}`);
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateExistingPosts();

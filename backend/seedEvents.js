import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Event from "./models/Event.js";

const events = [
  {
    title: "Tech Fest 2024",
    description:
      "Join us for an exciting day of technology, innovation, and networking. Featuring keynote speakers, workshops, and competitions! Don't miss this amazing opportunity to connect with tech enthusiasts.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: "SUST Auditorium",
  },
  {
    title: "Cultural Night",
    description:
      "Experience the vibrant culture of SUST! Enjoy music, dance, drama, and traditional performances by talented students. Food stalls will be available.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    location: "Central Field",
  },
  {
    title: "Career Fair 2024",
    description:
      "Meet top employers and explore career opportunities! Bring your resume and dress professionally. Companies from various sectors will be present.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    location: "Convention Hall",
  },
  {
    title: "Sports Day",
    description:
      "Annual inter-department sports competition! Cricket, football, badminton, and more. Come support your department and enjoy the games!",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: "SUST Stadium",
  },
  {
    title: "Hackathon 2024",
    description:
      "24-hour coding marathon! Form teams, solve real-world problems, and win exciting prizes. Free food and refreshments throughout the event.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    location: "CSE Building, Lab 301",
  },
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing events
    await Event.deleteMany({});
    console.log("Cleared existing events");

    // Insert new events
    await Event.insertMany(events);
    console.log("✅ Successfully seeded 5 events!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding events:", error);
    process.exit(1);
  }
};

seedEvents();

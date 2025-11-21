import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./socket/socketHandler.js";
import { startEventCleanup } from "./services/eventCleanupService.js";

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io with CORS for frontend
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Initialize socket handlers
initializeSocket(io);

// Make io accessible in routes
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start event cleanup service
  startEventCleanup();
});

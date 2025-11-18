import Message from "../models/Message.js";
import User from "../models/User.js";
import { generateChatId } from "../controllers/chatController.js";

// Store online users: { userId: socketId }
const onlineUsers = new Map();

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins with their userId
    socket.on("userOnline", async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} is online`);

      // Update lastActive
      try {
        await User.findByIdAndUpdate(userId, { lastActive: new Date() });
      } catch (error) {
        console.error("Error updating lastActive:", error);
      }

      // Broadcast online status
      io.emit("userStatusChange", { userId, online: true });
      io.emit("userOnline", userId);
      // Send list of all online users
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // Join events room for real-time updates
    socket.on("joinEvents", () => {
      socket.join("events");
      console.log(`Socket ${socket.id} joined events room`);
    });

    // Leave events room
    socket.on("leaveEvents", () => {
      socket.leave("events");
      console.log(`Socket ${socket.id} left events room`);
    });

    // Join a specific chat room
    socket.on("joinRoom", (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    // Send message
    socket.on(
      "sendMessage",
      async ({
        chatId,
        senderId,
        receiverId,
        message,
        messageType,
        attachments,
      }) => {
        try {
          // Save message to database
          const newMessage = await Message.create({
            chatId,
            senderId,
            receiverId,
            message: message || "",
            messageType: messageType || "text",
            attachments: attachments || [],
          });

          // Populate sender info
          await newMessage.populate("senderId", "name profilePicture");
          await newMessage.populate("receiverId", "name profilePicture");

          // Emit to chat room
          io.to(chatId).emit("receiveMessage", newMessage);

          // Also emit to receiver's personal socket if they're online but not in room
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessageNotification", {
              chatId,
              senderId,
              message: newMessage,
            });
          }
        } catch (error) {
          socket.emit("messageError", { message: error.message });
        }
      }
    );

    // Typing indicator
    socket.on("typing", ({ chatId, userId, isTyping }) => {
      socket.to(chatId).emit("userTyping", { userId, isTyping });
    });

    // Mark messages as read
    socket.on("markAsRead", async ({ chatId, userId }) => {
      try {
        await Message.updateMany(
          { chatId, receiverId: userId, read: false },
          { read: true }
        );
        socket.to(chatId).emit("messagesRead", { chatId, userId });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Delete message
    socket.on("deleteMessage", ({ chatId, messageId, deleteType }) => {
      io.to(chatId).emit("messageDeleted", { messageId, deleteType });
    });

    // Disconnect
    socket.on("disconnect", async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        // Update lastActive on disconnect
        try {
          await User.findByIdAndUpdate(socket.userId, {
            lastActive: new Date(),
          });
        } catch (error) {
          console.error("Error updating lastActive on disconnect:", error);
        }

        io.emit("userStatusChange", { userId: socket.userId, online: false });
        io.emit("userOffline", socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());

// Helper function to emit event updates
export const emitEventUpdate = (io, eventType, eventData) => {
  io.to("events").emit("eventUpdate", { type: eventType, data: eventData });
};

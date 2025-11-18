import Message from "../models/Message.js";
import { uploadImage } from "../services/cloudinaryService.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Generate deterministic chatId
export const generateChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join(":");
};

// Get chat history between two users
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();
    const chatId = generateChatId(currentUserId, userId);

    const messages = await Message.find({ chatId })
      .populate("senderId", "name profilePicture")
      .populate("receiverId", "name profilePicture")
      .sort({ createdAt: 1 })
      .limit(100); // Last 100 messages

    // Mark messages as read
    await Message.updateMany(
      { chatId, receiverId: currentUserId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all recent chats for current user
export const getRecentChats = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    // Get all messages involving current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    })
      .populate("senderId", "name profilePicture")
      .populate("receiverId", "name profilePicture")
      .sort({ createdAt: -1 });

    // Group by chatId and get latest message for each chat
    const chatMap = new Map();

    for (const msg of messages) {
      // Skip messages with deleted users
      if (!msg.senderId || !msg.receiverId) {
        continue;
      }

      if (!chatMap.has(msg.chatId)) {
        const otherUser =
          msg.senderId._id.toString() === currentUserId
            ? msg.receiverId
            : msg.senderId;

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          chatId: msg.chatId,
          receiverId: currentUserId,
          read: false,
        });

        chatMap.set(msg.chatId, {
          chatId: msg.chatId,
          otherUser,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount,
        });
      }
    }

    const recentChats = Array.from(chatMap.values());
    res.json(recentChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload file/image for chat
export const uploadChatFile = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = await uploadImage(req.file);

      res.json({
        url: fileUrl,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  },
];

// Delete message for me only
export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Add current user to deletedFor array
    if (!message.deletedFor.includes(currentUserId)) {
      message.deletedFor.push(currentUserId);
      await message.save();
    }

    res.json({ message: "Message deleted for you", messageId });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

// Delete message for everyone
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id.toString();

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete for everyone
    if (message.senderId.toString() !== currentUserId) {
      return res.status(403).json({
        message: "You can only delete your own messages for everyone",
      });
    }

    message.deletedForEveryone = true;
    message.message = "This message was deleted";
    message.attachments = [];
    await message.save();

    res.json({ message: "Message deleted for everyone", messageId });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

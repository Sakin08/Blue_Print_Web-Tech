// Utility functions for chat feature

// Generate deterministic chatId from two user IDs
export const generateChatId = (userId1, userId2) => {
  return [userId1, userId2].sort().join(":");
};

// Format timestamp for chat messages
export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Format relative time for recent chats
export const formatRelativeTime = (date) => {
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return msgDate.toLocaleDateString();
};

// Get user initials for avatar
export const getUserInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Truncate message for preview
export const truncateMessage = (message, maxLength = 50) => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
};

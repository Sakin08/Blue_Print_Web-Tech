import api from "./axios.js";

export const chatApi = {
  getChatHistory: (userId) => api.get(`/chat/${userId}`),
  getRecentChats: () => api.get("/chat/recent"),
  getUnreadCount: () => api.get("/chat/unread-count"),
  uploadFile: (formData) =>
    api.post("/chat/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteMessageForMe: (messageId) =>
    api.delete(`/chat/message/${messageId}/delete-for-me`),
  deleteMessageForEveryone: (messageId) =>
    api.delete(`/chat/message/${messageId}/delete-for-everyone`),
};

export default chatApi;

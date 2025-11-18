import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: `${API_URL}/notifications`,
  withCredentials: true,
});

const notificationsApi = {
  getAll: () => api.get("/"),
  getUnreadCount: () => api.get("/unread-count"),
  markAsRead: (id) => api.patch(`/${id}/read`),
  markAllAsRead: () => api.patch("/read-all"),
  delete: (id) => api.delete(`/${id}`),
  deleteNotification: (id) => api.delete(`/${id}`),
  deleteAll: () => api.delete("/delete-all"),
};

export default notificationsApi;

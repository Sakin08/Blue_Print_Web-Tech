import api from "./axios.js";

export default {
  getAll: () => api.get("/events"),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post("/events", data),
  markInterested: (id) => api.patch(`/events/${id}/interested`),
  remove: (id) => api.delete(`/events/${id}`),
};

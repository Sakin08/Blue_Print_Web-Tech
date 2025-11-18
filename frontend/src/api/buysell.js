import api from "./axios.js";

export default {
  getAll: () => api.get("/buysell"),
  getOne: (id) => api.get(`/buysell/${id}`),
  getById: (id) => api.get(`/buysell/${id}`),
  create: (data) =>
    api.post("/buysell", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) => api.put(`/buysell/${id}`, data),
  remove: (id) => api.delete(`/buysell/${id}`),
};

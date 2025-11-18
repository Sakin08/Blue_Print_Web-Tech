import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${API_URL}/saved-posts`,
  withCredentials: true,
});

export const savePost = (postId, postType) =>
  api.post("/save", { postId, postType });

export const unsavePost = (postId, postType) =>
  api.delete(`/unsave/${postId}/${postType}`);

export const getMySavedPosts = () => api.get("/my-saved");

export const checkIfSaved = (postId, postType) =>
  api.get(`/is-saved/${postId}/${postType}`);

export default {
  savePost,
  unsavePost,
  getMySavedPosts,
  checkIfSaved,
};

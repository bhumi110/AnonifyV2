import api from "./api";

export const getPostsApi = (params) =>
  api.get("/posts", { params });

export const getPostByIdApi = (id) =>
  api.get(`/posts/${id}`);

export const createPostApi = (data) =>
  api.post("/posts", data);

export const updatePostApi = (id, data) =>
  api.put(`/posts/${id}`, data);

export const deletePostApi = (id) =>
  api.delete(`/posts/${id}`);

export const reactPostApi = (id, reaction) =>
  api.post(`/posts/${id}/react/${reaction}`);
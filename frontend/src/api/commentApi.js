import api from "./axiosInstance";

export const createCommentApi = (postId, data) =>
  api.post(`/comments/${postId}`, data);

export const deleteCommentApi = (id) =>
  api.delete(`/comments/${id}`);

export const reviewCommentApi = (postId, commentId, type) =>
  api.post(
    `/comments/${postId}/${commentId}/review/${type}`
  );
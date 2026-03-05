import api from "./api";

export const createCommentApi = (postId, data) =>
  api.post(`/comments/${postId}`, data);

export const deleteCommentApi = (commentId) =>
  api.delete(`/comments/${commentId}`);

export const reviewCommentApi = (commentId, type) =>
  api.post(`/comments/${commentId}/review/${type}`);

export const createReplyApi = (commentId, data) =>
  api.post(`/comments/${commentId}/reply`, data);
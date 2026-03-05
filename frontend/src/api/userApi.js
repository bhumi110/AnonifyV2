import api from "./api";

export const getProfileApi = () => api.get('/users/profile');

export const getUserProfileApi = (id) => api.get(`/users/${id}`);
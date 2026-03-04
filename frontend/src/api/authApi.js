import api from "./api";

export const loginApi = (data) => api.post("/auth/login", data);

export const registerApi = (data) => api.post("/auth/register", data);

export const getProfileApi = () => api.get("/users/profile");

export const logoutApi = () => Promise.resolve();
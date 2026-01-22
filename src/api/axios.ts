import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, 
});

// token jwt automatique via authorization header s'il est utilise 
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;

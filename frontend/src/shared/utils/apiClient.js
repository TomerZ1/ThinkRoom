import axios from "axios";
import { API_BASE_URL } from "../constants/config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // must match how you store it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

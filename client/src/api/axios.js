import axios from "axios";
import { getAuthToken, logout } from "./authUtils";

// Create a new axios instance
const api = axios.create({
  baseURL:
    import.meta.env?.VITE_API_URL ||
    window.env?.REACT_APP_API_URL ||
    "http://localhost:3000/api", // Using localhost for development
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      console.log(
        "📦 Attaching token to request:",
        token.substring(0, 15) + "..."
      );
      config.headers["Authorization"] = `Bearer ${token}`;

      // For file uploads and form data, make sure we're not overriding the content type
      if (config.data instanceof FormData) {
        // Don't set the Content-Type header, let the browser set it with the boundary
        delete config.headers["Content-Type"];
        console.log("FormData detected, removed Content-Type header");
      }
    } else {
      console.log("⚠️ No auth token available");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response) {
      const { status } = error.response;

      if (status === 401 || status === 403) {
        console.error("🔒 Authentication error:", status);

        // Clear tokens on auth failure
        logout();

        // You could redirect here, but it's better to handle redirects
        // in the component that made the request
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

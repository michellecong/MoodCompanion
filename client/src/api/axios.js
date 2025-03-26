import axios from "axios";

// 创建一个axios实例
const api = axios.create({
  baseURL:
    import.meta.env?.VITE_API_URL ||
    window.env?.REACT_APP_API_URL ||
    "https://moodcompanion-api.onrender.com/api", // api base_url
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ask axios to send cookies
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// the response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // do something with the response error
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// utils/helpers.js
export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // 从 API 基础 URL 中提取服务器根路径
  const apiBaseUrl =
    import.meta.env?.VITE_API_URL ||
    window.env?.REACT_APP_API_URL ||
    "https://moodcompanion-api.onrender.com/api";

  // 提取根 URL（去掉末尾的 '/api'）
  const baseUrl = apiBaseUrl.endsWith("/api")
    ? apiBaseUrl.slice(0, -4)
    : apiBaseUrl;

  return `${baseUrl}${path}`;
};

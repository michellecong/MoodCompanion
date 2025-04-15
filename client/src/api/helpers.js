export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  if (path.startsWith("//res.cloudinary.com")) {
    return `https:${path}`;
  }

  const apiBaseUrl =
    import.meta.env?.VITE_API_URL ||
    window.env?.REACT_APP_API_URL ||
    "https://moodcompanion-api.onrender.com/api";

  const baseUrl = apiBaseUrl.endsWith("/api")
    ? apiBaseUrl.slice(0, -4)
    : apiBaseUrl;

  return `${baseUrl}${path}`;
};

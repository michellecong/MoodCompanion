// src/utils/authUtils.js

/**
 * Gets the best available authentication token
 * Prioritizes Auth0 token, then falls back to app token
 * @returns {string|null} The authentication token or null if none found
 */
export const getAuthToken = () => {
  const auth0Token = localStorage.getItem("token");
  if (auth0Token) {
    return auth0Token;
  }

  const appToken = localStorage.getItem("app_token");
  if (appToken) {
    return appToken;
  }

  return null;
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = localStorage.getItem("user");

  return !!(token && user);
};

/**
 * Gets the current user from localStorage
 * @returns {Object|null} The user object or null if not logged in
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error("Error parsing user JSON:", e);
    return null;
  }
};

/**
 * Clears all authentication data from local storage
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("app_token");
  localStorage.removeItem("user");
};

/**
 * Updates the stored user data
 * @param {Object} userData - The user data to store
 */
export const updateUserData = (userData) => {
  if (!userData) return;

  try {
    const currentUser = getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  } catch (e) {
    console.error("Error updating user data:", e);
  }
};

/**
 * Stores Auth0 token in localStorage
 * @param {string} token - The Auth0 token
 */
export const storeAuth0Token = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    return true;
  }
  return false;
};

/**
 * Stores app JWT token in localStorage
 * @param {string} token - The app JWT token
 */
export const storeAppToken = (token) => {
  if (token) {
    localStorage.setItem("app_token", token);
    return true;
  }
  return false;
};

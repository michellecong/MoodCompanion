import React from "react";
import { getAssetUrl } from "../../api/helpers";
import "./Avatar.css";

const Avatar = ({ user, size = "md", className = "" }) => {
  // If we don't have a user at all, show a placeholder
  if (!user) {
    return (
      <div className={`avatar avatar-placeholder avatar-${size} ${className}`}>
        ?
      </div>
    );
  }

  // Get user's first initial (or ? if no username)
  const initial = user.username ? user.username.charAt(0).toUpperCase() : "?";
  const backgroundColor = user.avatarColor || "#4299E1"; // Default blue if not set

  // If user has an avatar image, show it
  if (user.avatar) {
    return (
      <img
        src={getAssetUrl(user.avatar)}
        alt={user.username || "User"}
        className={`avatar avatar-${size} ${className}`}
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop
          // Show initial-based avatar as fallback when image fails to load
          e.target.style.display = "none"; // Hide the img element

          // Create initial-based avatar dynamically
          const parent = e.target.parentNode;
          const div = document.createElement("div");
          div.className = `avatar avatar-${size} ${className}`;
          div.style.backgroundColor = backgroundColor;
          div.innerText = initial;
          parent.appendChild(div);
        }}
      />
    );
  }

  // Default: Show initial-based avatar
  return (
    <div
      className={`avatar avatar-${size} avatar-initial ${className}`}
      style={{ backgroundColor }}
    >
      <span className={`avatar-text avatar-text-${size}`}>{initial}</span>
    </div>
  );
};

export default Avatar;

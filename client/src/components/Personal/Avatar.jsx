import React, { useState } from "react";
import { getAssetUrl } from "../../api/helpers";

import "./Avatar.css";

const Avatar = ({ user, size = "md", className = "" }) => {
  const [imgError, setImgError] = useState(false);

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

  // If user has an avatar image and no error loading it, show the image
  if (user.avatar && !imgError) {
    return (
      <img
        src={getAssetUrl(user.avatar)}
        alt={user.username || "User"}
        className={`avatar avatar-${size} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Default or fallback: Show initial-based avatar
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

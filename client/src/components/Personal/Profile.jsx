import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Avatar from "./Avatar";
import "./Profile.css";

// User profile component
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setProfile(response.data.data);
        setFormData({
          username: response.data.data.username,
          email: response.data.data.email,
          avatar: response.data.data.avatar || null,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file cannot exceed 2MB");
      return;
    }

    // Create URL for preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // We'll handle the actual file upload on form submission
    setFormData({ ...formData, avatarFile: file });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If editing, restore original data when canceling
      setFormData({
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
      });
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let updatedFormData = { ...formData };

      // If we have a new avatar file, upload it first
      if (formData.avatarFile) {
        const fileFormData = new FormData();
        fileFormData.append("file", formData.avatarFile);

        const uploadResponse = await api.post("/users/upload", fileFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Set the avatar path from the upload response
        updatedFormData.avatar = uploadResponse.data.filePath;
      }

      // Update user profile
      const response = await api.put("/users/profile", {
        username: updatedFormData.username,
        email: updatedFormData.email,
        avatar: updatedFormData.avatar,
      });

      const refreshResponse = await api.get("/users/profile");
      setProfile(refreshResponse.data.data);

      setIsEditing(false);

      // Update locally stored user info
      const user = JSON.parse(localStorage.getItem("user"));
      const updatedUser = {
        ...user,
        username: updatedFormData.username,
        email: updatedFormData.email,
        avatar: updatedFormData.avatar,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Clear avatar preview
      setAvatarPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-retry"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2 className="profile-title">Profile</h2>
        <button
          onClick={handleEditToggle}
          className={`btn btn-edit ${isEditing ? "btn-cancel" : "btn-primary"}`}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="avatar">
              Avatar
            </label>
            <div className="avatar-upload-container">
              <div className="avatar-container">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="avatar-preview"
                  />
                ) : (
                  <Avatar user={profile} size="xl" />
                )}
              </div>

              <div>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="avatar" className="avatar-upload-label">
                  Upload New Avatar
                </label>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        avatar: null,
                        avatarFile: null,
                      });
                      setAvatarPreview(null);
                    }}
                    className="avatar-remove-btn"
                  >
                    Remove Avatar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-input"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              minLength="3"
              maxLength="30"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-input"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleEditToggle}
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-save">
              Save
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="user-info-header">
            <div className="avatar-container">
              <Avatar user={profile} size="xl" />
            </div>

            <div className="user-info-meta">
              <h3 className="user-name">{profile.username}</h3>
              <p className="user-email">{profile.email}</p>
              <p className="user-join-date">
                Joined: {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="profile-section">
            <h4 className="section-title">Account Information</h4>
            <div className="info-table">
              <div className="info-row">
                <p className="info-label">Username</p>
                <p className="info-value">{profile.username}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Email</p>
                <p className="info-value">{profile.email}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Role</p>
                <p className="info-value">{profile.role}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Last Login</p>
                <p className="info-value">
                  {new Date(profile.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {profile.journals && profile.journals.length > 0 && (
            <div className="profile-section">
              <h4 className="section-title">
                My Journals ({profile.journals.length})
              </h4>

              <div className="journal-list">
                {profile.journals.map((journal) => (
                  <div key={journal._id} className="journal-item">
                    <div className="journal-header">
                      <p className="journal-title">{journal.title}</p>
                      <p className="journal-date">
                        {new Date(journal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;

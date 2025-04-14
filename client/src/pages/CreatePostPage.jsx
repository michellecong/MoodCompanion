import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axios";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If using Auth0, ensure we have a fresh token
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          localStorage.setItem("token", token);
          console.log("Auth0 token refreshed and stored");
        }

        // Check if we have any token stored
        const hasToken =
          localStorage.getItem("token") || localStorage.getItem("app_token");
        if (!hasToken) {
          console.log("No authentication token found");
          navigate("/login");
          return;
        }

        setAuthChecked(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setError("Authentication failed. Please log in again.");
        navigate("/login");
      }
    };

    checkAuth();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size should be less than 5MB");
        return;
      }

      setImage(file);
      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter your post content");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Convert comma-separated tags to array and trim whitespace
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      // Use FormData to handle file upload
      const formData = new FormData();
      formData.append("content", content);
      tagsArray.forEach((tag) => formData.append("tags", tag));

      if (image) {
        formData.append("image", image);
      }

      // If using Auth0, ensure we have the latest token
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("token", token);
          console.log("Auth0 token refreshed before submission");
        } catch (err) {
          console.error("Failed to refresh Auth0 token:", err);
        }
      }

      console.log("Submitting post with FormData");

      const response = await api.post("/wishing-well/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Important for file upload
        },
      });

      if (response.data.success) {
        // Redirect to the newly created post
        const newPostId = response.data.data._id;
        navigate(`/post/${newPostId}`);
      } else {
        setError(response.data.message || "Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);

      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";

      // Add specific handling for authentication errors
      if (err.response?.status === 401) {
        setError("Authentication error. Please log in again.");

        // Clear tokens on auth failure
        localStorage.removeItem("token");
        localStorage.removeItem("app_token");

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state until auth is checked
  if (!authChecked) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <h1 className="page-title">Share Your Thoughts</h1>
      <p className="page-description">
        Express yourself anonymously in the Wishing Well
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="content">Your Message:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, wishes, or feelings..."
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Add an Image (optional):</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              accept="image/*"
              className="image-input"
            />
            <label htmlFor="image" className="image-upload-button">
              Select Image
            </label>
            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={handleRemoveImage}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated):</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="love, hope, dreams, etc."
          />
          <p className="tag-hint">
            Adding relevant tags helps others find your post
          </p>
        </div>

        <div className="button-group">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/posts")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? "Posting..." : "Share Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;

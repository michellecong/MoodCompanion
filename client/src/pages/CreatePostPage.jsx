import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

      const response = await api.post("/wishing-well/posts", {
        content,
        tags: tagsArray,
      });

      if (response.data.success) {
        // Redirect to the newly created post
        const newPostId = response.data.data._id;
        navigate(`/post/${newPostId}`);
      } else {
        setError(response.data.message || "Failed to create post");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
      console.error("Error creating post:", err);
    } finally {
      setSubmitting(false);
    }
  };

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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null); // 添加图片状态
  const [previewUrl, setPreviewUrl] = useState(null); // 添加预览URL状态
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // 处理图片选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // 创建预览URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // 移除已选择的图片
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

      // 使用FormData来支持文件上传
      const formData = new FormData();
      formData.append("content", content);
      tagsArray.forEach((tag) => formData.append("tags", tag));

      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/wishing-well/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // 改变内容类型
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

        {/* 添加图片上传区域 */}
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

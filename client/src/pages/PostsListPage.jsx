import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./PostsListPage.css";

const PostsListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const endpoint = "/wishing-well/posts";

        // Get all posts, don't use backend tag filtering
        const response = await api.get(endpoint);

        // If a tag is selected, filter on the frontend
        const allPosts = response.data.data;
        const filteredPosts = selectedTag
          ? allPosts.filter(
              (post) => post.tags && post.tags.includes(selectedTag)
            )
          : allPosts;
        setPosts(filteredPosts);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
        setLoading(false);
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, [selectedTag]);

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? "" : tag);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="posts-list-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Wishing Well</h1>
          <p className="page-description">
            Share your thoughts, wishes, and connect with others in this
            anonymous space.
          </p>
        </div>
        <button onClick={handleCreatePost} className="create-post-button">
          Create Post
        </button>
      </div>

      {/* Display for currently selected tag */}
      {selectedTag && (
        <div className="selected-tag">
          Filtering by: <span>{selectedTag}</span>
          <button onClick={() => setSelectedTag("")} className="clear-tag">
            ✕
          </button>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="no-posts">No posts found.</div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              <Link to={`/post/${post._id}`} className="post-link">
                <div className="post-content">
                  {post.content.length > 150
                    ? `${post.content.substring(0, 150)}...`
                    : post.content}
                </div>
                <div className="post-footer">
                  <div className="post-stats">
                    <span className="upvotes">❤️ {post.upvotes}</span>
                    <span className="comments">💬 {post.commentCount}</span>
                  </div>
                  <div className="post-date">{formatDate(post.createdAt)}</div>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="tag"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTagClick(tag);
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsListPage;

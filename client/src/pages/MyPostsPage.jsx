import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getAssetUrl } from "../api/helpers";
import "./MyPostsPage.css";

const MyPostsPage = ({ isAuthenticated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/my-posts");
    }
  }, [isAuthenticated, navigate]);

  // Fetch user's posts when the component mounts or page changes
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/wishing-well/posts/me?page=${currentPage}`
        );

        if (response.data && response.data.success) {
          setPosts(response.data.data);
          setTotalPages(response.data.totalPages);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setError("Failed to load your posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserPosts();
    }
  }, [currentPage, isAuthenticated]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Truncate text for preview
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  if (loading) {
    return <div className="loading">Loading your posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="my-posts-container">
      <h1 className="myposts-page-title">My Posts</h1>

      <div className="page-actions">
        <Link to="/create-post" className="create-post-btn">
          Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>You haven't created any posts yet.</p>
          <Link to="/create-post" className="create-first-post-btn">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map((post) => (
              <Link
                to={`/post/${post._id}?from=myposts`}
                key={post._id}
                className="post-card"
              >
                {post.image && (
                  <div className="post-image-container">
                    <img
                      src={getAssetUrl(post.image)}
                      alt="Post"
                      className="post-preview-image"
                    />
                  </div>
                )}
                <div className="post-preview-content">
                  <p className="post-preview-text">
                    {truncateText(post.content)}
                  </p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="post-preview-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="preview-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="post-preview-footer">
                    <span className="post-stats">
                      <span className="preview-upvotes">❤️ {post.upvotes}</span>
                      <span className="preview-comments">
                        💬 {post.commentCount || 0}
                      </span>
                    </span>
                    <span className="post-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyPostsPage;

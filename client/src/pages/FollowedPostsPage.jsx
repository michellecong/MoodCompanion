import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./FollowedPostsPage.css";

const FollowedPostsPage = ({ isAuthenticated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  // First check authentication status before doing anything else
  useEffect(() => {
    // Check for token in localStorage as a backup authentication method
    const token = localStorage.getItem("token");
    const isLoggedIn = isAuthenticated || !!token;

    if (!isLoggedIn) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login?redirect=/followed-posts");
    }
  }, [isAuthenticated, navigate]);

  // Fetch followed posts
  useEffect(() => {
    // Check authentication again to prevent unnecessary API calls
    const token = localStorage.getItem("token");
    const isLoggedIn = isAuthenticated || !!token;

    if (!isLoggedIn) {
      return;
    }

    const fetchFollowedPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching followed posts...");

        // Use the correct API endpoint
        const response = await api.get(
          `/wishing-well/posts/followed?page=${page}`
        );

        console.log("API response:", response.data);

        if (response.data && response.data.success) {
          setPosts(response.data.data);
          setTotalPages(response.data.totalPages || 1);
        } else {
          throw new Error("Failed to fetch followed posts");
        }
      } catch (err) {
        console.error("Error fetching followed posts:", err);

        // Check if it's an authentication error
        if (err.response && err.response.status === 401) {
          console.log("Authentication error, redirecting to login");
          navigate("/login?redirect=/followed-posts");
        } else {
          setError("Failed to fetch followed posts. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedPosts();
  }, [isAuthenticated, navigate, page]);

  // Handle unfollow
  const handleUnfollow = async (postId) => {
    try {
      const response = await api.put(`/wishing-well/posts/${postId}/unfollow`);

      if (response.data && response.data.success) {
        // Remove unfollowed post from the list
        setPosts(posts.filter((post) => post._id !== postId));
      }
    } catch (err) {
      console.error("Error unfollowing post:", err);
      setError("Failed to unfollow. Please try again later.");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // If the user is not authenticated, show a message
  const token = localStorage.getItem("token");
  const isLoggedIn = isAuthenticated || !!token;

  if (!isLoggedIn) {
    return (
      <div className="not-authenticated-container">
        <h2>Authentication Required</h2>
        <p>You need to be logged in to view your followed posts.</p>
        <Link to="/login?redirect=/followed-posts" className="login-link">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-container">Loading followed posts...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="followed-posts-container">
      <h1 className="page-title">Posts I Follow</h1>

      {posts.length === 0 ? (
        <div className="no-posts-message">
          <p>You haven't followed any posts yet</p>
          <Link to="/posts" className="browse-link">
            Browse All Posts
          </Link>
        </div>
      ) : (
        <>
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-content">{post.content}</div>

                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <Link to={`/posts?tag=${tag}`} key={tag} className="tag">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="post-footer">
                  <div className="post-stats">
                    <span className="upvotes">❤️ {post.upvotes}</span>
                    <span className="comments">
                      💬 {post.commentCount || 0}
                    </span>
                  </div>

                  <div className="post-actions">
                    <Link
                      to={`/post/${post._id}?from=followed`}
                      className="view-button"
                    >
                      View Details
                    </Link>
                    <button
                      className="unfollow-button"
                      onClick={() => handleUnfollow(post._id)}
                    >
                      Unfollow
                    </button>
                  </div>

                  <div className="post-date">{formatDate(post.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={handleNextPage}
                disabled={page === totalPages}
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

export default FollowedPostsPage;

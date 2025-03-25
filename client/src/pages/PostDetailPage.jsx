import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./PostsListPage.css";

const PostsListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // 'recent' or 'trending'

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        // Determine API endpoint based on sort selection
        const endpoint =
          sortBy === "trending"
            ? "/api/wishing-well/posts/trending"
            : "/api/wishing-well/posts";

        // Add tag filter if a tag is selected
        const tagParam = selectedTag ? `&tag=${selectedTag}` : "";

        const response = await axios.get(
          `${endpoint}?page=${currentPage}&limit=10${tagParam}`
        );

        setPosts(response.data.data);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
        setLoading(false);
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, [currentPage, selectedTag, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? "" : tag);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="posts-list-container">
      <h1 className="page-title">Wishing Well</h1>
      <p className="page-description">
        Share your thoughts, wishes, and connect with others in this anonymous
        space.
      </p>

      {/* Sort controls */}
      <div className="sort-controls">
        <button
          className={`sort-button ${sortBy === "recent" ? "active" : ""}`}
          onClick={() => handleSortChange("recent")}
        >
          Recent
        </button>
        <button
          className={`sort-button ${sortBy === "trending" ? "active" : ""}`}
          onClick={() => handleSortChange("trending")}
        >
          Trending
        </button>

        {selectedTag && (
          <div className="selected-tag">
            Filtering by: <span>{selectedTag}</span>
            <button onClick={() => setSelectedTag("")} className="clear-tag">
              ✕
            </button>
          </div>
        )}
      </div>

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsListPage;

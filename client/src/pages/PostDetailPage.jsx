import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./PostDetailPage.css";

const PostDetailPage = ({ isAuthenticated: propIsAuthenticated, user }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState("recent"); // 'recent' or 'top'
  const [submitting, setSubmitting] = useState(false);

  // Use combined authentication state, ensure both props and localStorage are checked
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);

  // Ensure authentication state includes both localStorage and props
  useEffect(() => {
    // Check authentication info from localStorage as backup
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      // Use authentication state passed from props
      setIsAuthenticated(propIsAuthenticated);
    }
  }, [propIsAuthenticated]);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/wishing-well/posts/${id}`);

        if (response.data && response.data.data) {
          setPost(response.data.data.post);
          // If comments are included in the initial response
          if (response.data.data.comments) {
            setComments(response.data.data.comments);
          } else {
            // Otherwise fetch comments separately
            fetchComments(commentSort);
          }
        } else {
          throw new Error("Invalid response format");
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load post. Please try again later.");
        setLoading(false);
        console.error("Error fetching post details:", err);
      }
    };

    fetchPostDetails();
  }, [id]);

  const fetchComments = async (sort = "recent") => {
    try {
      const sortParam = sort === "top" ? "sortBy=upvotes" : "";
      const response = await api.get(
        `/wishing-well/comments/post/${id}?${sortParam}`
      );

      if (response.data && response.data.data) {
        setComments(response.data.data);
      } else {
        console.error("Invalid comments response format:", response);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again later.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      await api.post("/wishing-well/comments", {
        postId: id,
        content: commentText,
      });
      setCommentText("");
      fetchComments(commentSort);
      setSubmitting(false);
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again later.");
      setSubmitting(false);
    }
  };

  const handleSortChange = (sort) => {
    setCommentSort(sort);
    fetchComments(sort);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleUpvotePost = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    try {
      const response = await api.put(`/wishing-well/posts/${id}/upvote`);
      if (response.data && response.data.data) {
        setPost({ ...post, upvotes: response.data.data.upvotes });
      }
    } catch (err) {
      console.error("Error upvoting post:", err);
      setError("Failed to upvote post. Please try again later.");
    }
  };

  const handleUpvoteComment = async (commentId) => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    try {
      const response = await api.put(
        `/wishing-well/comments/${commentId}/upvote`
      );
      if (response.data && response.data.data) {
        const updatedComments = comments.map((comment) =>
          comment._id === commentId
            ? { ...comment, upvotes: response.data.data.upvotes }
            : comment
        );
        setComments(updatedComments);
      }
    } catch (err) {
      console.error("Error upvoting comment:", err);
      setError("Failed to upvote comment. Please try again later.");
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !post) {
    return <div className="error-message">{error || "Post not found"}</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="back-link">
        <Link to="/posts">← Back to all posts</Link>
      </div>

      <div className="post-detail-card">
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
            <button
              className="upvote-button"
              onClick={handleUpvotePost}
              disabled={!isAuthenticated}
            >
              ❤️ {post.upvotes}
            </button>
            <span className="comments-count">
              💬 {post.commentCount || comments.length}
            </span>
          </div>
          <div className="post-date">{formatDate(post.createdAt)}</div>
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-header">
          Comments ({comments.length})
          <div className="comments-sort">
            <button
              className={`sort-button ${
                commentSort === "recent" ? "active" : ""
              }`}
              onClick={() => handleSortChange("recent")}
            >
              Recent
            </button>
            <button
              className={`sort-button ${commentSort === "top" ? "active" : ""}`}
              onClick={() => handleSortChange("top")}
            >
              Top
            </button>
          </div>
        </h3>

        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              required
            />
            <div className="form-footer">
              <small className="char-count">{commentText.length}/500</small>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="login-prompt">
            <Link to={`/login?redirect=/post/${id}`}>Sign in</Link> to leave a
            comment
          </div>
        )}

        {comments.length === 0 ? (
          <div className="no-comments">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment-card">
                <div className="comment-content">{comment.content}</div>
                <div className="comment-footer">
                  <button
                    className="upvote-button small"
                    onClick={() => handleUpvoteComment(comment._id)}
                    disabled={!isAuthenticated}
                  >
                    ❤️ {comment.upvotes}
                  </button>
                  <span className="comment-date">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;

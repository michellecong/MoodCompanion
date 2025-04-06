import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "./PostDetailPage.css";
import { getAssetUrl } from "../api/helpers";

const PostDetailPage = ({ isAuthenticated: propIsAuthenticated, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState("recent"); // 'recent' or 'top'
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const from = queryParams.get("from") || "";

  // use state to manage authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);
  const [currentUser, setCurrentUser] = useState(user);

  // add a function to handle the back button
  const handleGoBack = () => {
    if (from === "followed") {
      navigate("/followed-posts");
    } else {
      navigate("/posts"); // or navigate to a default page
    }
  };

  // ensure the authentication state is set correctly
  useEffect(() => {
    // change the logic to check for token in localStorage
    // and set the authentication state accordingly
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");

        setCurrentUser(userData);
      } catch (error) {
        console.error("error in parsing user data", error);
      }
    } else {
      // user is not authenticated
      setIsAuthenticated(propIsAuthenticated);
      setCurrentUser(user);
    }
  }, [propIsAuthenticated, user]);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/wishing-well/posts/${id}`);

        if (response.data && response.data.data) {
          setPost(response.data.data.post);
          // if the post contains comments, set them directly
          if (response.data.data.comments) {
            setComments(response.data.data.comments);
          } else {
            // if no comments are provided, fetch them
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

  // 1. add state to manage the follow status and loading state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followingPosts, setFollowingPosts] = useState([]);

  // 2. add a function to fetch the user's followed posts
  const fetchFollowingPosts = async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const response = await api.get("/user/me");

      if (response.data && response.data.success) {
        const userFollowingPosts = response.data.data.followingPosts || [];
        setFollowingPosts(userFollowingPosts);

        // check if the current post is in the user's followed posts
        setIsFollowing(userFollowingPosts.includes(id));
      }
    } catch (err) {
      console.error("Error in handling followed posts:", err);
    }
  };

  // 3. useEffect to fetch the followed posts when the component mounts
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchFollowingPosts();
    }
  }, [isAuthenticated, currentUser, id]);

  // 4. add a function to handle the follow/unfollow action
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    try {
      setFollowLoading(true);

      if (isFollowing) {
        // cancel follow
        const response = await api.put(`/wishing-well/posts/${id}/unfollow`);
        if (response.data && response.data.success) {
          setIsFollowing(false);
          // update the following posts list
          setFollowingPosts(followingPosts.filter((postId) => postId !== id));
        }
      } else {
        // follow
        const response = await api.put(`/wishing-well/posts/${id}/follow`);
        if (response.data && response.data.success) {
          setIsFollowing(true);
          // update the following posts list
          if (!followingPosts.includes(id)) {
            setFollowingPosts([...followingPosts, id]);
          }
        }
      }
    } catch (err) {
      console.error("Error in handling followed posts:", err);
      setError(
        isFollowing
          ? "Failed to unfollow the post. Please try again later."
          : "Failed to follow the post. Please try again later."
      );
    } finally {
      setFollowLoading(false);
    }
  };

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
      // if user is not authenticated, redirect to login
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post("/wishing-well/comments", {
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
      alert("You have already upvoted this post.");
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
      alert("You have already upvoted this comment.");
    }
  };

  // deal with post deletion
  const handleDeletePost = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/wishing-well/posts/${id}`);
      setIsDeleting(false);
      // Redirect to the posts page after deletion
      navigate("/posts");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again later.");
      setIsDeleting(false);
    }
  };

  // deal with comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this comment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/wishing-well/comments/${commentId}`);
      // Update the comments state to remove the deleted comment
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment. Please try again later.");
    }
  };

  const isPostOwner = () => {
    if (!post) return false;
    if (!isAuthenticated) return false;
    if (!currentUser) return false;

    // check condition 1: post.isOwner
    if (post.isOwner === true) {
      return true;
    }

    // check condition 2: post.userId
    const userId = currentUser._id || currentUser.id;
    if (userId && post.userId) {
      const isMatch = String(post.userId) === String(userId);

      if (isMatch) return true;
    }

    // check condition 3: post.userId === currentUser._id
    if (currentUser.role === "admin") {
      return true;
    }

    return false;
  };

  // check if the comment is owned by the current user
  const isCommentOwner = (commentUserId) => {
    if (!currentUser) return false;

    // commentUserId is the userId of the comment
    const userId = currentUser._id || currentUser.id;

    if (!userId || !commentUserId) return false;

    // compare the userId of the comment with the current user's id
    const currentId = String(userId);
    const commentId = String(commentUserId);

    const isOwner = currentId === commentId;
    const isAdmin = currentUser.role === "admin";

    return isOwner || isAdmin;
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
        {from === "followed" ? (
          <a onClick={handleGoBack} className="back-link-text">
            ← Return to Followed Posts
          </a>
        ) : (
          <a onClick={handleGoBack} className="back-link-text">
            ← Return
          </a>
        )}
      </div>

      <div className="post-detail-card">
        {post.image && (
          <div className="post-detail-image-container">
            <img
              src={getAssetUrl(post.image)}
              alt="Post content"
              className="post-image"
            />
          </div>
        )}
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

            {isAuthenticated && (
              <button
                className={`follow-button ${isFollowing ? "following" : ""}`}
                onClick={handleToggleFollow}
                disabled={followLoading}
                title={
                  isFollowing
                    ? "Unfollow this post"
                    : "Follow this post to receive updates"
                }
              >
                {followLoading
                  ? "Loading..."
                  : isFollowing
                  ? "Followed ✓"
                  : "Follow"}
              </button>
            )}

            {/* Post owner or admin can delete post */}
            {isAuthenticated && isPostOwner() && (
              <button
                className="delete-button"
                onClick={handleDeletePost}
                disabled={isDeleting}
              >
                🗑️ {isDeleting ? "Deleting..." : "Delete Post"}
              </button>
            )}
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
                {submitting ? "Posting..." : "Post"}
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

                  {isAuthenticated && isCommentOwner(comment.userId) && (
                    <button
                      className="delete-button small"
                      onClick={() => handleDeleteComment(comment._id)}
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  )}
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

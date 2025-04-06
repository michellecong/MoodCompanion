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

  // 使用结合的身份验证状态
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);
  const [currentUser, setCurrentUser] = useState(user);

  // 添加返回函数
  const handleGoBack = () => {
    if (from === "followed") {
      navigate("/followed-posts");
    } else {
      navigate("/posts"); // 默认返回上一页
    }
  };

  // 确保身份验证状态包括localStorage和props
  useEffect(() => {
    // 从localStorage检查身份验证信息作为备份
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
      // 使用从props传递的身份验证状态
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
          // 如果初始响应中包含评论
          if (response.data.data.comments) {
            setComments(response.data.data.comments);
          } else {
            // 否则单独获取评论
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

  // 1. 首先添加新的状态来跟踪关注状态
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followingPosts, setFollowingPosts] = useState([]);

  // 2. 添加一个函数来获取用户关注的帖子
  const fetchFollowingPosts = async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const response = await api.get("/user/me");

      if (response.data && response.data.success) {
        const userFollowingPosts = response.data.data.followingPosts || [];
        setFollowingPosts(userFollowingPosts);

        // 检查当前帖子是否在关注列表中
        setIsFollowing(userFollowingPosts.includes(id));
      }
    } catch (err) {
      console.error("Error in handling followed posts:", err);
    }
  };

  // 3. 在useEffect中调用这个函数
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchFollowingPosts();
    }
  }, [isAuthenticated, currentUser, id]);

  // 4. 实现关注/取消关注的处理函数
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${id}`;
      return;
    }

    try {
      setFollowLoading(true);

      if (isFollowing) {
        // 取消关注
        const response = await api.put(`/wishing-well/posts/${id}/unfollow`);
        if (response.data && response.data.success) {
          setIsFollowing(false);
          // 更新关注列表
          setFollowingPosts(followingPosts.filter((postId) => postId !== id));
        }
      } else {
        // 关注
        const response = await api.put(`/wishing-well/posts/${id}/follow`);
        if (response.data && response.data.success) {
          setIsFollowing(true);
          // 更新关注列表
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
      // 重定向到登录页面
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

  // 处理帖子删除的函数
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
      // 成功删除后重定向到帖子页面
      navigate("/posts");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again later.");
      setIsDeleting(false);
    }
  };

  // 处理评论删除的函数
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
      // 通过从列表中移除已删除的评论来更新评论列表
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

    // 检查条件1: API提供的isOwner标志
    if (post.isOwner === true) {
      return true;
    }

    // 检查条件2: 用户ID比较
    const userId = currentUser._id || currentUser.id;
    if (userId && post.userId) {
      const isMatch = String(post.userId) === String(userId);

      if (isMatch) return true;
    }

    // 检查条件3: 管理员角色
    if (currentUser.role === "admin") {
      return true;
    }

    return false;
  };

  // 检查用户是否是评论所有者或管理员的辅助函数
  const isCommentOwner = (commentUserId) => {
    if (!currentUser) return false;

    // 尝试从不同可能的位置获取用户ID
    const userId = currentUser._id || currentUser.id;

    if (!userId || !commentUserId) return false;

    // 确保都是字符串进行比较
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

                  {/* 评论删除按钮 - 直接比较userId和当前用户ID */}
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

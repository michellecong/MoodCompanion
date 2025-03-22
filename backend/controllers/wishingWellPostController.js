const WishingWellPost = require("../models/wishingWellPostModel");
const WishingWellComment = require("../models/wishingWellCommentModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

/**
 * Controller for WishingWellPost operations
 */
const wishingWellPostController = {
  /**
   * Create a new WishingWellPost
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createPost(req, res) {
    try {
      const { content, tags } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty",
        });
      }

      // Create new post
      const newPost = new WishingWellPost({
        userId,
        content,
        tags: tags || [],
      });

      await newPost.save();

      res.status(201).json({
        success: true,
        data: newPost,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create post",
        error: error.message,
      });
    }
  },

  /**
   * Get a single post by ID with its comments
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPostById(req, res) {
    try {
      const postId = req.params.id;

      // Find post
      const post = await WishingWellPost.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Skip fetching user details for privacy in anonymous posts
      // Instead just fetch the comments
      const comments = await WishingWellComment.find({
        postId,
        status: "active",
      })
        .sort({ createdAt: -1 })
        .select("-upvotedBy"); // Don't expose who upvoted

      res.status(200).json({
        success: true,
        data: {
          post: {
            ...post.toObject(),
            userId: undefined, // Hide the actual userId for anonymity
          },
          comments,
        },
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch post",
        error: error.message,
      });
    }
  },

  /**
   * Get trending posts (highest upvotes)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTrendingPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const posts = await WishingWellPost.find({ status: "active" })
        .sort({ upvotes: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-upvotedBy -userId"); // Don't expose user IDs or who upvoted

      const total = await WishingWellPost.countDocuments({ status: "active" });

      res.status(200).json({
        success: true,
        count: posts.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch trending posts",
        error: error.message,
      });
    }
  },

  /**
   * Get recent posts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecentPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const tagFilter = req.query.tag ? { tags: req.query.tag } : {};

      const posts = await WishingWellPost.find({
        status: "active",
        ...tagFilter,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-upvotedBy -userId"); // Don't expose user IDs or who upvoted

      const total = await WishingWellPost.countDocuments({
        status: "active",
        ...tagFilter,
      });

      res.status(200).json({
        success: true,
        count: posts.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching recent posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recent posts",
        error: error.message,
      });
    }
  },

  /**
   * Get followed posts for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFollowedPosts(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get user's followed posts
      const user = await User.findById(userId).select("followingPosts");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.followingPosts || user.followingPosts.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          totalPages: 0,
          currentPage: page,
          data: [],
        });
      }

      // Query posts by their IDs
      const posts = await WishingWellPost.find({
        _id: { $in: user.followingPosts },
        status: "active",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-upvotedBy -userId"); // Don't expose user IDs or who upvoted

      const total = await WishingWellPost.countDocuments({
        _id: { $in: user.followingPosts },
        status: "active",
      });

      res.status(200).json({
        success: true,
        count: posts.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching followed posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch followed posts",
        error: error.message,
      });
    }
  },

  /**
   * Upvote a post
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async upvotePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      // Find post
      const post = await WishingWellPost.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Check if user already upvoted
      if (post.upvotedBy.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "You have already upvoted this post",
        });
      }

      // Update post
      const updatedPost = await WishingWellPost.findByIdAndUpdate(
        postId,
        {
          $inc: { upvotes: 1 },
          $push: { upvotedBy: userId },
        },
        { new: true }
      ).select("-upvotedBy -userId"); // Don't expose user IDs or who upvoted

      res.status(200).json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      console.error("Error upvoting post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upvote post",
        error: error.message,
      });
    }
  },

  /**
   * Follow a post
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async followPost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      // Check if post exists
      const post = await WishingWellPost.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Add post to user's followed posts
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { followingPosts: postId } },
        { new: true }
      ).select("followingPosts");

      res.status(200).json({
        success: true,
        message: "Post followed successfully",
        followingPosts: user.followingPosts,
      });
    } catch (error) {
      console.error("Error following post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to follow post",
        error: error.message,
      });
    }
  },

  /**
   * Unfollow a post
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async unfollowPost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      // Remove post from user's followed posts
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { followingPosts: postId } },
        { new: true }
      ).select("followingPosts");

      res.status(200).json({
        success: true,
        message: "Post unfollowed successfully",
        followingPosts: user.followingPosts,
      });
    } catch (error) {
      console.error("Error unfollowing post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unfollow post",
        error: error.message,
      });
    }
  },

  /**
   * Delete a post
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deletePost(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Find post
      const post = await WishingWellPost.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Check if user is authorized (post owner or admin)
      if (post.userId.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this post",
        });
      }

      // Soft delete - update status instead of removing
      await WishingWellPost.findByIdAndUpdate(postId, {
        status: "deleted",
      });

      // Also update comments status
      await WishingWellComment.updateMany({ postId }, { status: "deleted" });

      res.status(200).json({
        success: true,
        message: "Post and associated comments deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete post",
        error: error.message,
      });
    }
  },

  /**
   * Get post stats by tag
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPostStatsByTag(req, res) {
    try {
      // Get counts by tag
      const tagStats = await WishingWellPost.aggregate([
        { $match: { status: "active" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      res.status(200).json({
        success: true,
        data: tagStats,
      });
    } catch (error) {
      console.error("Error fetching tag stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch tag statistics",
        error: error.message,
      });
    }
  },

  /**
   * Get user's own posts
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserPosts(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const posts = await WishingWellPost.find({
        userId,
        status: { $ne: "deleted" },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-upvotedBy"); // Don't expose who upvoted

      const total = await WishingWellPost.countDocuments({
        userId,
        status: { $ne: "deleted" },
      });

      res.status(200).json({
        success: true,
        count: posts.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user posts",
        error: error.message,
      });
    }
  },
};

module.exports = wishingWellPostController;

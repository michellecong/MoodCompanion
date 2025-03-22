const WishingWellComment = require("../models/wishingWellCommentModel");
const WishingWellPost = require("../models/wishingWellPostModel");
const mongoose = require("mongoose");

/**
 * Controller for WishingWellComment operations
 */
const wishingWellCommentController = {
  /**
   * Create a new comment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createComment(req, res) {
    try {
      const { postId, content } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Comment content cannot be empty",
        });
      }

      // Check if post exists and is active
      const post = await WishingWellPost.findOne({
        _id: postId,
        status: "active",
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found or not active",
        });
      }

      // Create new comment
      const newComment = new WishingWellComment({
        postId,
        userId,
        content,
      });

      await newComment.save();

      // Increment comment count in post
      await WishingWellPost.findByIdAndUpdate(postId, {
        $inc: { commentCount: 1 },
      });

      // Return comment without sensitive information
      const commentToReturn = {
        ...newComment.toObject(),
        userId: undefined, // Hide actual user ID for privacy
      };

      res.status(201).json({
        success: true,
        data: commentToReturn,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create comment",
        error: error.message,
      });
    }
  },

  /**
   * Get comments for a post
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPostComments(req, res) {
    try {
      const postId = req.params.postId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const sortBy =
        req.query.sortBy === "upvotes" ? { upvotes: -1 } : { createdAt: -1 };

      // Validate post exists
      const postExists = await WishingWellPost.exists({
        _id: postId,
        status: "active",
      });

      if (!postExists) {
        return res.status(404).json({
          success: false,
          message: "Post not found or not active",
        });
      }

      // Fetch comments
      const comments = await WishingWellComment.find({
        postId,
        status: "active",
      })
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select("-upvotedBy -userId"); // Don't expose user IDs or who upvoted

      const total = await WishingWellComment.countDocuments({
        postId,
        status: "active",
      });

      res.status(200).json({
        success: true,
        count: comments.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: comments,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch comments",
        error: error.message,
      });
    }
  },

  /**
   * Upvote a comment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async upvoteComment(req, res) {
    try {
      const commentId = req.params.id;
      const userId = req.user.id;

      // Find comment
      const comment = await WishingWellComment.findById(commentId);

      if (!comment || comment.status !== "active") {
        return res.status(404).json({
          success: false,
          message: "Comment not found or not active",
        });
      }

      // Check if user already upvoted
      if (comment.upvotedBy.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "You have already upvoted this comment",
        });
      }

      // Update comment
      const updatedComment = await WishingWellComment.findByIdAndUpdate(
        commentId,
        {
          $inc: { upvotes: 1 },
          $push: { upvotedBy: userId },
        },
        { new: true }
      ).select("-upvotedBy -userId"); // Don't expose user IDs or who upvoted

      res.status(200).json({
        success: true,
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error upvoting comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upvote comment",
        error: error.message,
      });
    }
  },

  /**
   * Delete a comment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteComment(req, res) {
    try {
      const commentId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Find comment
      const comment = await WishingWellComment.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Check if user is authorized (comment owner or admin)
      if (comment.userId.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this comment",
        });
      }

      // Soft delete - update status instead of removing
      await WishingWellComment.findByIdAndUpdate(commentId, {
        status: "deleted",
      });

      // Decrement comment count in post
      await WishingWellPost.findByIdAndUpdate(comment.postId, {
        $inc: { commentCount: -1 },
      });

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete comment",
        error: error.message,
      });
    }
  },

  /**
   * Get user's own comments
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserComments(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch comments
      const comments = await WishingWellComment.find({
        userId,
        status: { $ne: "deleted" },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("postId", "content tags")
        .select("-upvotedBy"); // Don't expose who upvoted

      const total = await WishingWellComment.countDocuments({
        userId,
        status: { $ne: "deleted" },
      });

      res.status(200).json({
        success: true,
        count: comments.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: comments,
      });
    } catch (error) {
      console.error("Error fetching user comments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user comments",
        error: error.message,
      });
    }
  },

  /**
   * Report a comment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async reportComment(req, res) {
    try {
      const commentId = req.params.id;
      const { reason } = req.body;

      // Find and update comment
      const comment = await WishingWellComment.findByIdAndUpdate(
        commentId,
        { status: "reported" },
        { new: true }
      );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Here you could log the report to a separate collection if needed
      // For simplicity, we're just changing the status

      res.status(200).json({
        success: true,
        message: "Comment reported successfully",
      });
    } catch (error) {
      console.error("Error reporting comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to report comment",
        error: error.message,
      });
    }
  },
};

module.exports = wishingWellCommentController;

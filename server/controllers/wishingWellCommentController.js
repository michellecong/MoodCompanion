// controllers/wishingWellCommentController.js (ESM version)
import mongoose from "mongoose";
import WishingWellComment from "../models/wishingWellCommentModel.js";
import WishingWellPost from "../models/wishingWellPostModel.js";

const wishingWellCommentController = {
  async createComment(req, res) {
    try {
      const { postId, content } = req.body;
      const userId = req.user.id;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Comment content cannot be empty",
        });
      }

      const post = await WishingWellPost.findOne({ _id: postId, status: "active" });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found or not active",
        });
      }

      const newComment = new WishingWellComment({ postId, userId, content });
      await newComment.save();

      await WishingWellPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

      const commentToReturn = {
        ...newComment.toObject(),
        userId: undefined,
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

  async getPostComments(req, res) {
    try {
      const postId = req.params.postId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const sortBy = req.query.sortBy === "upvotes" ? { upvotes: -1 } : { createdAt: -1 };

      const postExists = await WishingWellPost.exists({ _id: postId, status: "active" });

      if (!postExists) {
        return res.status(404).json({
          success: false,
          message: "Post not found or not active",
        });
      }

      const comments = await WishingWellComment.find({ postId, status: "active" })
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select("-upvotedBy");

      const total = await WishingWellComment.countDocuments({ postId, status: "active" });

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

  async upvoteComment(req, res) {
    try {
      const commentId = req.params.id;
      const userId = req.user.id;

      const comment = await WishingWellComment.findById(commentId);

      if (!comment || comment.status !== "active") {
        return res.status(404).json({
          success: false,
          message: "Comment not found or not active",
        });
      }

      if (comment.upvotedBy.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "You have already upvoted this comment",
        });
      }

      const updatedComment = await WishingWellComment.findByIdAndUpdate(
        commentId,
        { $inc: { upvotes: 1 }, $push: { upvotedBy: userId } },
        { new: true }
      ).select("-upvotedBy -userId");

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

  async deleteComment(req, res) {
    try {
      const commentId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const comment = await WishingWellComment.findById(commentId);

      if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }

      if (comment.userId.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this comment",
        });
      }

      await WishingWellComment.findByIdAndUpdate(commentId, { status: "deleted" });
      await WishingWellPost.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

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

  async getUserComments(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const comments = await WishingWellComment.find({ userId, status: { $ne: "deleted" } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("postId", "content tags")
        .select("-upvotedBy");

      const total = await WishingWellComment.countDocuments({ userId, status: { $ne: "deleted" } });

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

  async reportComment(req, res) {
    try {
      const commentId = req.params.id;
      const { reason } = req.body;

      const comment = await WishingWellComment.findByIdAndUpdate(
        commentId,
        { status: "reported" },
        { new: true }
      );

      if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
      }

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

export default wishingWellCommentController;

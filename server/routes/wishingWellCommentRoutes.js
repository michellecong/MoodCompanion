const express = require("express");
const router = express.Router();
const {
  createComment,
  getPostComments,
  upvoteComment,
  deleteComment,
} = require("../controllers/wishingWellCommentController");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const wishingWellCommentController = require("../controllers/wishingWellCommentController");

/**
 * Middleware to validate request
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST api/wishing-well/comments
 * @desc    Create a new comment
 * @access  Private
 */
router.post(
  "/",
  auth,
  [
    check("postId", "Post ID is required").not().isEmpty(),
    check("content", "Content cannot be empty").not().isEmpty(),
    check("content", "Content is too long").isLength({ max: 500 }),
  ],
  validateRequest,
  createComment
);

/**
 * @route   GET api/wishing-well/comments/post/:postId
 * @desc    Get comments for a post
 * @access  Public
 */
router.get("/post/:postId", getPostComments);

/**
 * @route   PUT api/wishing-well/comments/:id/upvote
 * @desc    Upvote a comment
 * @access  Private
 */
router.put("/:id/upvote", auth, upvoteComment);

/**
 * @route   DELETE api/wishing-well/comments/:id
 * @desc    Delete a comment
 * @access  Private
 */
router.delete("/:id", auth, deleteComment);

/**
 * @route   GET api/wishing-well/comments/:id/upvote-status
 * @desc    Check if the user has upvoted a comment
 * @access  Private
 */
router.get("/:id/upvote-status", auth, wishingWellCommentController.checkCommentUpvoteStatus);

/**
 * @route   PUT api/wishing-well/comments/:id/remove-upvote
 * @desc    Remove upvote from a comment
 * @access  Private
 */
router.put("/:id/remove-upvote", auth, wishingWellCommentController.removeCommentUpvote);

module.exports = router;

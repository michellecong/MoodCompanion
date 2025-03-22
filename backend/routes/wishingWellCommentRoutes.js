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

module.exports = router;

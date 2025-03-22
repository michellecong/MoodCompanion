const express = require("express");
const router = express.Router();
const {
  createPost,
  getRecentPosts,
  getPostById,
  getUserPosts,
  upvotePost,
  followPost,
  unfollowPost,
  deletePost,
} = require("../controllers/wishingWellPostController");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const { validateRequest } = require("../middleware/validators");

/**
 * @route   POST api/wishing-well/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  "/",
  auth,
  [
    check("content", "Content cannot be empty").not().isEmpty(),
    check("content", "Content is too long").isLength({ max: 1000 }),
  ],
  validateRequest,
  createPost
);

/**
 * @route   GET api/wishing-well/posts
 * @desc    Get recent posts (optionally filtered by tag)
 * @access  Public
 */
router.get("/", getRecentPosts);

/**
 * @route   GET api/wishing-well/posts/user
 * @desc    Get user's own posts
 * @access  Private
 */
router.get("/me", auth, getUserPosts);
/**
 * @route   GET api/wishing-well/posts/:id
 * @desc    Get a post by ID with its comments
 * @access  Public
 */
router.get("/:id", getPostById);

/**
 * @route   PUT api/wishing-well/posts/:id/upvote
 * @desc    Upvote a post
 * @access  Private
 */
router.put("/:id/upvote", auth, upvotePost);

/**
 * @route   PUT api/wishing-well/posts/:id/follow
 * @desc    Follow a post
 * @access  Private
 */
router.put("/:id/follow", auth, followPost);
/**
 * @route   PUT api/wishing-well/posts/:id/unfollow
 * @desc    Unfollow a post
 * @access  Private
 */
router.put("/:id/unfollow", auth, unfollowPost);

/**
 * @route   DELETE api/wishing-well/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete("/:id", auth, deletePost);

module.exports = router;

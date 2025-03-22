const express = require("express");
const router = express.Router();
const {
  createPost,
  getRecentPosts,
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
module.exports = router;

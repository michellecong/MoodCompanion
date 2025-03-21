const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { validateRequest } = require("../middleware/validators");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public routes
router.post(
  "/register",
  [
    check("currentPassword", "Current password is required").not().isEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  validateRequest,
  register
);

// login route
router.post("/login", login);

/**
 * @route   GET api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", auth, getProfile);

/**
 * @route   PUT api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  auth,
  [
    check("username", "Username must be between 3 and 30 characters")
      .optional()
      .isLength({ min: 3, max: 30 }),
    check("email", "Please include a valid email").optional().isEmail(),
  ],
  validateRequest,
  updateProfile
);

/**
 * @route   PUT api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  auth,
  [
    check("currentPassword", "Current password is required").not().isEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  validateRequest,
  changePassword
);

/**
 * @route   DELETE api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  "/account",
  auth,
  [check("password", "Password is required").exists()],
  validateRequest,
  deleteAccount
);

module.exports = router;

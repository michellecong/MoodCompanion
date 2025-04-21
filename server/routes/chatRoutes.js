const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const {
  chatMessage,
  saveChat,
  getChatById,
} = require("../controllers/chatController");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Publically available functionality
router.post("/", chatMessage);
// Private functionality (requires authentication)
/**
 * @route   POST api/chats/save
 * @desc    save a chat
 * @access  Private
 */
router.post("/save", auth, validateRequest, saveChat);
router.post("/save", saveChat);
router.get("/:id", getChatById);

module.exports = router;

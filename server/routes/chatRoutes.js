const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const {
  chatMessage,
  saveChat,
  getChatById,
  getUserChats,
  updateChat,
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
 * * @route   GET api/chats
 * * @desc    get all saved chats for the authenticated user
 * * @access  Private
 */
router.get("/", auth, validateRequest, getUserChats);

/**
 * @route   POST api/chats/save
 * @desc    save a chat
 * @access  Private
 */
router.post("/save", auth, validateRequest, saveChat);

/**
 * * @route   PUT api/chats/update/:id
 * * @desc    update a chat by ID
 * * @access  Private
 */
router.put(
  "/update/:id",
  auth,
  validateRequest,
  [
    check("messages", "Messages are required").not().isEmpty(),
    check("messages", "Messages must be an array").isArray(),
  ],
  updateChat
);

/**
 * * @route   GET api/chats/:id
 * @desc    get a chat by ID
 * * @access  Private
 * */
router.get("/:id", auth, validateRequest, getChatById);

module.exports = router;

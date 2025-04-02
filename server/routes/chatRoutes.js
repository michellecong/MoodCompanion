const express = require("express");
const router = express.Router();
const {sendChatMessage} = require("../controllers/chatController");

const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
/**
 * @route   POST api/chat
 */

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST api/chat
 * @desc    send a chat message
 * @access  Private
 */
router.post(
  "/",

  auth,

  // check("title", "title can not be empty").not().isEmpty(),
  // check("content", "content can not be empty").not().isEmpty(),

  validateRequest,
  sendChatMessage
);

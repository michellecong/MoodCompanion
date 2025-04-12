const express = require("express");
const router = express.Router();
const {
  chatMessage,
  saveChat,
  getUserChats,
  getChatById,
} = require("../controllers/chatController");
const { validationResult } = require("express-validator");
const auth = require("../middleware/auth");

// Optional validation middleware
/* const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

*/
// Public
router.post("/", auth, chatMessage);

// Private
router.post("/save", auth, saveChat);

router.get("/:id", auth, getChatById);

module.exports = router;

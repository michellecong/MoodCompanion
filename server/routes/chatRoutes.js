// routes/chatRoutes.js (ESM version)

import express from "express";
const router = express.Router();
import chatController from "../controllers/chatController.js";
import { validationResult } from "express-validator";
import auth from "../middleware/auth.js";

// Optional validation middleware
/* const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}; */

// Public
router.post("/", chatController.chatMessage);

// Private
router.post("/save", auth, chatController.saveChat);

router.get("/:id", auth, chatController.getChatById);

export default router;

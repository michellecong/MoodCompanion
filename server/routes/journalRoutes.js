// routes/journalRoutes.js (ESM version)

import express from "express";
const router = express.Router();
import journalController from "../controllers/journalController.js";
import { check, validationResult } from "express-validator";
import auth from "../middleware/auth.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/",
  auth,
  // check("title", "title can not be empty").not().isEmpty(),
  // check("content", "content can not be empty").not().isEmpty(),
  validateRequest,
  journalController.createJournal
);

router.get("/", auth, journalController.getUserJournals);

router.delete("/:id", auth, journalController.deleteJournal);

router.get("/:id", auth, journalController.getJournalById);

router.put(
  "/:id",
  auth,
  [
    check("title", "Title cannot be empty").optional().not().isEmpty(),
    check("content", "Content cannot be empty").optional().not().isEmpty(),
  ],
  validateRequest,
  journalController.updateJournal
);

export default router;

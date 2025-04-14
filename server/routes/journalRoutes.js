// routes/journalRoutes.js (ESM version)

import express from "express";
const router = express.Router();
import journalController from "../controllers/journalController.js";
import { check, validationResult } from "express-validator";
import { validateRequest } from "../middleware/validators.js";

// POST /api/journals - Create new journal
router.post(
  "/",
  [
    // optional: uncomment these validators if needed
    // check("title", "Title cannot be empty").not().isEmpty(),
    // check("content", "Content cannot be empty").not().isEmpty(),
    validateRequest,
  ],
  journalController.createJournal
);

// GET /api/journals - Get all journals for the authenticated user
router.get("/", journalController.getUserJournals);

// GET /api/journals/:id - Get a single journal by ID
router.get("/:id", journalController.getJournalById);

// PUT /api/journals/:id - Update a journal
router.put(
  "/:id",
  [
    check("title", "Title cannot be empty").optional().not().isEmpty(),
    check("content", "Content cannot be empty").optional().not().isEmpty(),
    validateRequest,
  ],
  journalController.updateJournal
);

// DELETE /api/journals/:id - Delete a journal
router.delete("/:id", journalController.deleteJournal);

export default router;

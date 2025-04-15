// controllers/journalController.js (ESM version)

import Journal from "../models/journalModel.js";
import User from "../models/userModel.js";
import { detectEmotions, generateFeedback } from "../services/emotionService.js";

const journalController = {
  /**
   * Create a new journal entry with emotion detection
   */
  async createJournal(req, res) {
    try {
      const { title, content } = req.body;
      const auth0Id = req.user?.sub;

      if (!auth0Id) {
        return res.status(401).json({ success: false, message: "Missing user identity" });
      }

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: "The title and content cannot be empty",
        });
      }

      // ✅ Find the user by Auth0 ID (not Mongo _id)
      const user = await User.findOne({ auth0Id });
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const emotionsDetected = await detectEmotions(content);
      const feedback = generateFeedback(emotionsDetected);

      const newJournal = new Journal({
        userId: user._id, // ✅ Use MongoDB ObjectId from the user document
        title,
        content,
        emotionsDetected,
        feedback,
      });

      await newJournal.save();

      await User.findByIdAndUpdate(
        user._id,
        { $push: { journals: newJournal._id } },
        { new: true }
      );

      res.status(201).json({
        success: true,
        data: newJournal,
      });
    } catch (error) {
      console.error("Error creating journal:", error);
      res.status(500).json({
        success: false,
        message: "Journal creation failed",
        error: error.message,
      });
    }
  },

  /**
   * Get all journals for the authenticated user (with pagination)
   */
  async getUserJournals(req, res) {
    try {
      const userId = req.user?.sub;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [journals, total] = await Promise.all([
        Journal.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Journal.countDocuments({ userId }),
      ]);

      res.status(200).json({
        success: true,
        count: journals.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: journals,
      });
    } catch (error) {
      console.error("Error fetching journals:", error);
      res.status(500).json({
        success: false,
        message: "Journal fetch failed",
        error: error.message,
      });
    }
  },

  /**
   * Delete a journal entry
   */
  async deleteJournal(req, res) {
    try {
      const journalId = req.params.id;
      const userId = req.user?.sub;

      const journal = await Journal.findById(journalId);
      if (!journal) {
        return res.status(404).json({ success: false, message: "Journal not found" });
      }

      if (journal.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this journal" });
      }

      await Journal.findByIdAndDelete(journalId);

      await User.findByIdAndUpdate(
        userId,
        { $pull: { journals: journalId } },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Journal deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting journal:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete journal",
        error: error.message,
      });
    }
  },

  /**
   * Get a single journal by ID
   */
  async getJournalById(req, res) {
    try {
      const journalId = req.params.id;
      const userId = req.user?.sub;

      const journal = await Journal.findById(journalId);
      if (!journal) {
        return res.status(404).json({ success: false, message: "Journal not found" });
      }

      if (journal.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to access this journal" });
      }

      console.log("Returning journal:", journal);

      res.status(200).json({
        success: true,
        data: journal,
      });
    } catch (error) {
      console.error("Error fetching journal:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch journal",
        error: error.message,
      });
    }
  },

  /**
   * Update a journal entry
   */
  async updateJournal(req, res) {
    try {
      const journalId = req.params.id;
      const userId = req.user?.sub;
      const { title, content } = req.body;

      if (!title && !content) {
        return res.status(400).json({
          success: false,
          message: "Please provide title or content to update",
        });
      }

      let journal = await Journal.findById(journalId);
      if (!journal) {
        return res.status(404).json({ success: false, message: "Journal not found" });
      }

      if (journal.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Not authorized to update this journal" });
      }

      const updateData = {};
      let updatedContent = journal.content;

      if (title) updateData.title = title;
      if (content) {
        updateData.content = content;
        updatedContent = content;
      }

      const emotionsDetected = await detectEmotions(updatedContent);
      updateData.emotionsDetected = emotionsDetected;
      updateData.feedback = generateFeedback(emotionsDetected);

      journal = await Journal.findByIdAndUpdate(
        journalId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: journal,
      });
    } catch (error) {
      console.error("Error updating journal:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update journal",
        error: error.message,
      });
    }
  }
};

export default journalController;

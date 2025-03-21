const Journal = require("../models/journalModel");
const User = require("../models/userModel");
const { ObjectId } = require("mongodb");

// const emotionService = require("../services/emotionService");

/**
 * Journal controller for handling journal-related operations
 */
const journalController = {
  /**
   * Create a new journal entry with emotion detection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createJournal(req, res) {
    try {
      const { title, content } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "The title and contentn can not be empty" });
      }

      // Detect emotions in the journal content
      // const emotionsDetected = await emotionService.detectEmotions(content);
      const emotionsDetected = [
        { name: "joy", score: 0.8 },
        { name: "sadness", score: 0.2 },
      ];

      // Generate personalized feedback based on detected emotions
      // const feedback = emotionService.generateFeedback(emotionsDetected);
      const feedback = "This is a feed back";

      // Create new journal entry
      const newJournal = new Journal({
        userId,
        title,
        content,
        emotionsDetected,
        feedback,
      });

      await newJournal.save();

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
   * Get all journals for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserJournals(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const journals = await Journal.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Journal.countDocuments({ userId });

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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */

  async deleteJournal(req, res) {
    try {
      const journalId = req.params.id;
      const userId = req.user.id;

      // Find the journal
      const journal = await Journal.findById(journalId);

      // Check if journal exists
      if (!journal) {
        return res.status(404).json({
          success: false,
          message: "Journal not found",
        });
      }

      // Check if the journal belongs to the authenticated user
      if (journal.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this journal",
        });
      }

      // Delete the journal
      await Journal.findByIdAndDelete(journalId);

      // Remove journal reference from user
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
};

module.exports = journalController;

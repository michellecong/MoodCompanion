const Journal = require("../models/journalModel");
const User = require("../models/userModel");
const emotionService = require("../services/emotionService");

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
  
      if (!title || !content) {
        return res
          .status(400)
          .json({ message: "The title and content cannot be empty" });
      }
  
      const emotionsDetected = await emotionService.detectEmotions(content);
      const feedback = emotionService.generateFeedback(emotionsDetected);
  
      const newJournal = new Journal({
        userId,
        title,
        content,
        emotionsDetected,
        feedback,
      });
  
      await newJournal.save();
  
      await User.findByIdAndUpdate(
        userId,
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

      const [journals, total] = await Promise.all([
        Journal.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

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
  /**
   * Get a single journal by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getJournalById(req, res) {
    try {
      const journalId = req.params.id;
      const userId = req.user.id;

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
          message: "Not authorized to access this journal",
        });
      }
      console.log('Returning journal:', journal); // 添加日志

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
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateJournal(req, res) {
    try {
      const journalId = req.params.id;
      const userId = req.user.id;
      const { title, content } = req.body;
  
      if (!title && !content) {
        return res.status(400).json({
          success: false,
          message: "Please provide title or content to update",
        });
      }
  
      let journal = await Journal.findById(journalId);
      if (!journal) {
        return res.status(404).json({
          success: false,
          message: "Journal not found",
        });
      }
  
      if (journal.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this journal",
        });
      }
  
      const updateData = {};
      let updatedContent = journal.content;
  
      if (title) updateData.title = title;
      if (content) {
        updateData.content = content;
        updatedContent = content;
      }
  
      const emotionsDetected = await emotionService.detectEmotions(updatedContent);
      updateData.emotionsDetected = emotionsDetected;
      updateData.feedback = emotionService.generateFeedback(emotionsDetected);
  
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
}

module.exports = journalController;

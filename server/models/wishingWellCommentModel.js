const mongoose = require("mongoose");

const WishingWellCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WishingWellPost",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "deleted", "reported"],
    default: "active",
  },
  // Array of users who have upvoted this comment (for preventing multiple upvotes)
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Indexes for faster querying
WishingWellCommentSchema.index({ postId: 1, createdAt: -1 }); // For fetching comments by post
WishingWellCommentSchema.index({ userId: 1 }); // For user's comments
WishingWellCommentSchema.index({ upvotes: -1 }); // For sorting by popularity

module.exports = mongoose.model("WishingWellComment", WishingWellCommentSchema);

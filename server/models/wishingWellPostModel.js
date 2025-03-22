const mongoose = require("mongoose");

const WishingWellPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tags: [
    {
      type: String,
      trim: true,
      maxlength: 30,
    },
  ],
  upvotes: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "archived", "deleted", "reported"],
    default: "active",
  },
  // Array of users who have upvoted this post (for preventing multiple upvotes)
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // Count of comments for faster access
  commentCount: {
    type: Number,
    default: 0,
  },
});

// Indexes for faster querying
WishingWellPostSchema.index({ createdAt: -1 }); // For recent posts
WishingWellPostSchema.index({ upvotes: -1 }); // For trending posts
WishingWellPostSchema.index({ tags: 1 }); // For tag search
WishingWellPostSchema.index({ userId: 1, createdAt: -1 }); // For user's posts

// Virtual for getting all comments
WishingWellPostSchema.virtual("comments", {
  ref: "WishingWellComment",
  localField: "_id",
  foreignField: "postId",
});

module.exports = mongoose.model("WishingWellPost", WishingWellPostSchema);

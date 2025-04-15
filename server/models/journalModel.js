import mongoose from "mongoose";

const EmotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const JournalSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
  },
  emotionsDetected: [EmotionSchema],
  feedback: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
JournalSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

// Virtual for formattedDate
JournalSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Index for faster queries by userId
JournalSchema.index({ userId: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", JournalSchema);
export default Journal;

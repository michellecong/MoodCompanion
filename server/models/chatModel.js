// models/chatModel.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  messages: { type: [MessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ChatSchema.pre("save", function (next) {
  if (this.isModified()) this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Chat", ChatSchema);

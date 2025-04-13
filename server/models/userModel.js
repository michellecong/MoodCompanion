// models/userModel.js (ESM version)

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const FriendRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  role: {
    type: String,
    default: "user",
  },
  avatar: {
    type: String,
    default: null,
  },
  avatarColor: {
    type: String,
    default: function () {
      const colors = [
        "#4299E1",
        "#48BB78",
        "#ED8936",
        "#9F7AEA",
        "#F56565",
        "#38B2AC",
        "#667EEA",
        "#D53F8C",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  journals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friendRequests: [FriendRequestSchema],
  followingPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WishingWellPost",
    },
  ],
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", UserSchema);
export default User;

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const userController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { username }] });

      if (user) {
        return res.status(400).json({
          success: false,
          message:
            user.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      // Create new user
      user = new User({
        username,
        email,
        passwordHash: password, // Will be hashed by pre-save middleware
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "70d" }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id)
        .select("-passwordHash")
        .populate("friends", "username profilePicture")
        .populate("journals", "title createdAt");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get profile",
        error: error.message,
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { username, email, profilePicture } = req.body;

      // Check if username or email already exists
      if (username || email) {
        const existingUser = await User.findOne({
          $and: [
            { _id: { $ne: req.user.id } },
            { $or: [{ username: username || "" }, { email: email || "" }] },
          ],
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message:
              existingUser.email === email
                ? "Email already in use"
                : "Username already taken",
          });
        }
      }

      // Update user
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (profilePicture) updateData.profilePicture = profilePicture;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true }
      ).select("-passwordHash");

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },

  async handleFriendRequest(req, res) {
    try {
      const { requestId, action } = req.body;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find the friend request
      const requestIndex = user.friendRequests.findIndex(
        (req) => req._id.toString() === requestId
      );

      if (requestIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Friend request not found",
        });
      }

      const request = user.friendRequests[requestIndex];

      if (action === "accept") {
        // Add to friends list
        user.friends.push(request.from);

        // Add current user to the requester's friends list
        await User.findByIdAndUpdate(request.from, {
          $push: { friends: user._id },
        });
      }

      // Remove the request regardless of action
      user.friendRequests.splice(requestIndex, 1);
      await user.save();

      res.status(200).json({
        success: true,
        message:
          action === "accept"
            ? "Friend request accepted"
            : "Friend request rejected",
      });
    } catch (error) {
      console.error("Handle friend request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to handle friend request",
        error: error.message,
      });
    }
  },
};

module.exports = userController;

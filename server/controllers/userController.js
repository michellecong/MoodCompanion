const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const userController = {
  async register(req, res) {
    try {
      console.log("Req sent to register");
      const { username, email, password } = req.body;
      console.log("req.body", req.body);
      // Check if all fields are provided
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields (username, email, password) are required",
        });
      }
      
      if (user) {
        return res.status(400).json({
          success: false,
          message: user.email === email
            ? "Email already registered"
            : "Username already taken",
        });
      }

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
        { expiresIn: "70d" }
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
  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId)
        .select("-passwordHash")
        .populate("journals", "title createdAt");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  },

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, email, profilePicture } = req.body;

      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (profilePicture) updateData.profilePicture = profilePicture;

      // Check if username or email already exists
      if (username || email) {
        const existingUser = await User.findOne({
          $and: [
            { _id: { $ne: userId } },
            {
              $or: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : []),
              ],
            },
          ],
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message:
              existingUser.username === username
                ? "Username already taken"
                : "Email already registered",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-passwordHash");

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },

  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Check if inputs exist
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      const user = await User.findById(userId);

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.passwordHash = newPassword; // Will be hashed by pre-save middleware
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: error.message,
      });
    }
  },

  /**
   * Delete user account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      // Verify password
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      // Delete all user's journals
      await Journal.deleteMany({ userId });

      // Delete user
      await User.findByIdAndDelete(userId);

      res.status(200).json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete account",
        error: error.message,
      });
    }
  },

  /**
   * Send friend request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendFriendRequest(req, res) {
    try {
      const fromUserId = req.user.id;
      const { toUserId, message } = req.body;

      // Check if users exist
      const [fromUser, toUser] = await Promise.all([
        User.findById(fromUserId),
        User.findById(toUserId),
      ]);

      if (!toUser) {
        return res.status(404).json({
          success: false,
          message: "User to send request to not found",
        });
      }

      // Check if already friends
      if (toUser.friends.includes(fromUserId)) {
        return res.status(400).json({
          success: false,
          message: "Already friends with this user",
        });
      }

      // Check if request already sent
      const existingRequest = toUser.friendRequests.find(
        (request) => request.from.toString() === fromUserId
      );

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "Friend request already sent",
        });
      }

      // Add friend request
      toUser.friendRequests.push({
        from: fromUserId,
        message: message || "",
      });

      await toUser.save();

      res.status(200).json({
        success: true,
        message: "Friend request sent successfully",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send friend request",
        error: error.message,
      });
    }
  },

  /**
   * Accept or reject friend request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleFriendRequest(req, res) {
    try {
      const userId = req.user.id;
      const { requestId, action } = req.body;

      // Validate action
      if (!["accept", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid action, must be 'accept' or 'reject'",
        });
      }

      // Find user and request
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Find request index
      const requestIndex = user.friendRequests.findIndex(
        (request) => request._id.toString() === requestId
      );

      if (requestIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Friend request not found",
        });
      }

      // Get request data
      const request = user.friendRequests[requestIndex];
      const fromUserId = request.from;

      // Remove request
      user.friendRequests.splice(requestIndex, 1);

      // If accepting, add to friends list for both users
      if (action === "accept") {
        // Add to current user's friends
        if (!user.friends.includes(fromUserId)) {
          user.friends.push(fromUserId);
        }

        // Add to sender's friends
        await User.findByIdAndUpdate(fromUserId, {
          $addToSet: { friends: userId },
        });
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: `Friend request ${
          action === "accept" ? "accepted" : "rejected"
        } successfully`,
      });
    } catch (error) {
      console.error("Error handling friend request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to handle friend request",
        error: error.message,
      });
    }
  },
  /**
   * Get friends list
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFriends(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId)
        .populate("friends", "username email profilePicture")
        .select("friends");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        count: user.friends.length,
        data: user.friends,
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch friends",
        error: error.message,
      });
    }
  },

  async removeFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.params;

      // Remove friend from current user
      await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });

      // Remove current user from friend's list
      await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

      res.status(200).json({
        success: true,
        message: "Friend removed successfully",
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove friend",
        error: error.message,
      });
    }
  },
};

module.exports = userController;

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const auth0 = require("auth0");

// create an Auth0 Management client
const auth0ManagementClient = new auth0.ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

const userController = {
  // replace the original register method
  async handleAuth0Registration(req, res) {
    try {
      // get user info from Auth0
      const { sub, email, nickname } = req.body.user;

      // check if user exists
      let user = await User.findOne({ email });

      if (user) {
        // user exists, update last login time
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "70d" }
        );

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
            createdAt: user.createdAt,
          },
        });
      }

      // create new user
      user = new User({
        username: nickname || email.split("@")[0],
        email,
        passwordHash: Math.random().toString(36), // random password
        auth0Id: sub, // store Auth0 ID
      });

      await user.save();

      // generate JWT token
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
          avatar: user.avatar,
          avatarColor: user.avatarColor,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Auth0 registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  },

  async handleAuth0Login(req, res) {
    try {
      console.log("Auth0 callback request body:", req.body);

      // check if user info is present
      if (!req.body.user || !req.body.user.email) {
        return res.status(400).json({
          success: false,
          message: "Missing required Auth0 user information",
        });
      }

      // get user info from Auth0
      const { sub, email, nickname } = req.body.user;

      // check if user exists
      let user = await User.findOne({ email });

      if (user) {
        // current user exists, update last login time
        // Check if the user is already linked to Auth0
        user.lastLogin = Date.now();
        await user.save();

        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "70d" }
        );

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
          },
        });
      }

      // create new user
      // Check if the user already exists in Auth0
      try {
        user = new User({
          username: nickname || email.split("@")[0],
          email,
          passwordHash: Math.random().toString(36),
        });

        await user.save();

        // generate JWT token
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "70d" }
        );

        return res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
          },
        });
      } catch (saveError) {
        console.error("Error saving new user:", saveError);
        return res.status(500).json({
          success: false,
          message: "Failed to create new user",
          error: saveError.message,
        });
      }
    } catch (error) {
      console.error("Auth0 registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
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
      const { username, email, avatar } = req.body; // 移除 profilePicture

      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (avatar !== undefined) updateData.avatar = avatar; // Allow null to remove avatar

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
        data: {
          ...updatedUser._doc,
          initials: updatedUser.username.charAt(0).toUpperCase(),
        },
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

  // async changePassword(req, res) {
  //   try {
  //     const userId = req.user.id;
  //     const { currentPassword, newPassword } = req.body;

  //     // Check if inputs exist
  //     if (!currentPassword || !newPassword) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Current password and new password are required",
  //       });
  //     }

  //     const user = await User.findById(userId);

  //     // Verify current password
  //     const isMatch = await user.comparePassword(currentPassword);
  //     if (!isMatch) {
  //       return res.status(401).json({
  //         success: false,
  //         message: "Current password is incorrect",
  //       });
  //     }

  //     // Update password
  //     user.passwordHash = newPassword; // Will be hashed by pre-save middleware
  //     await user.save();

  //     res.status(200).json({
  //       success: true,
  //       message: "Password changed successfully",
  //     });
  //   } catch (error) {
  //     console.error("Error changing password:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Failed to change password",
  //       error: error.message,
  //     });
  //   }
  // },

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
        .populate("friends", "username email avatar avatarColor")
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

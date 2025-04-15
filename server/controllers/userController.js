<<<<<<< HEAD
// controllers/userController.js (ESM version)

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Journal from "../models/journalModel.js";
=======
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const auth0 = require('auth0');

// create an Auth0 Management client
const auth0ManagementClient = new auth0.ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
});
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7

const userController = {
  // replace the original register method
  async handleAuth0Registration(req, res) {
    try {
<<<<<<< HEAD
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields (username, email, password) are required",
        });
      }

      let user = await User.findOne({ $or: [{ email }, { username }] });
=======
      // get user info from Auth0
      const { sub, email, nickname } = req.body.user;
      
      // check if user exists
      let user = await User.findOne({ email });
      
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
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
<<<<<<< HEAD

=======
      
      // create new user
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
      user = new User({
        username: nickname || email.split('@')[0],
        email,
<<<<<<< HEAD
        passwordHash: password,
=======
        passwordHash: Math.random().toString(36), // random password
        auth0Id: sub, // store Auth0 ID
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
      });
      
      await user.save();
<<<<<<< HEAD

=======
      
      // generate JWT token
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
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
<<<<<<< HEAD

  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: "Username or email and password are required",
        });
      }

      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      user.lastLogin = Date.now();
      await user.save();

=======
  
  // replace the original login method
  async handleAuth0Login(req, res) {
    try {
      // get user info from Auth0
      const { sub, email } = req.body.user;
      
      // check if user exists
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found, please register first",
        });
      }
      
      // update last login time
      user.lastLogin = Date.now();
      await user.save();
      
      // generate JWT token
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
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
          avatar: user.avatar,
          avatarColor: user.avatarColor,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("Auth0 login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  },

<<<<<<< HEAD
=======
  /**
   * Get user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7
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

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, email, avatar } = req.body;

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (avatar !== undefined) updateData.avatar = avatar;

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
<<<<<<< HEAD

  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }
=======
  
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
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7

  //     const user = await User.findById(userId);

<<<<<<< HEAD
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.passwordHash = newPassword;
      await user.save();
=======
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
>>>>>>> 5f4ae191b526ab0293cc073bcc2208273020cbd7

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

  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      const user = await User.findById(userId);
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      await Journal.deleteMany({ userId });
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

  async sendFriendRequest(req, res) {
    try {
      const fromUserId = req.user.id;
      const { toUserId, message } = req.body;

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

      if (toUser.friends.includes(fromUserId)) {
        return res.status(400).json({
          success: false,
          message: "Already friends with this user",
        });
      }

      const existingRequest = toUser.friendRequests.find(
        (request) => request.from.toString() === fromUserId
      );

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: "Friend request already sent",
        });
      }

      toUser.friendRequests.push({ from: fromUserId, message: message || "" });
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

  async handleFriendRequest(req, res) {
    try {
      const userId = req.user.id;
      const { requestId, action } = req.body;

      if (!["accept", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid action, must be 'accept' or 'reject'",
        });
      }

      const user = await User.findById(userId);
      const requestIndex = user.friendRequests.findIndex(
        (request) => request._id.toString() === requestId
      );

      if (requestIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Friend request not found" });
      }

      const request = user.friendRequests[requestIndex];
      const fromUserId = request.from;

      user.friendRequests.splice(requestIndex, 1);

      if (action === "accept") {
        if (!user.friends.includes(fromUserId)) {
          user.friends.push(fromUserId);
        }
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

  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId)
        .populate("friends", "username email avatar avatarColor")
        .select("friends");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
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

      await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
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
  // Enhanced syncAuth0User method for userController.js

  async syncAuth0User(req, res) {
    try {
      const { auth0Id, email, username, avatar, name } = req.body;

      if (!auth0Id || !email) {
        return res.status(400).json({
          success: false,
          message: "Auth0 ID and email are required",
        });
      }

      // Check if the user already exists by auth0Id or email
      let user = await User.findOne({
        $or: [{ auth0Id }, { email }],
      });

      let isNewUser = false;
      let lastLogin = new Date();

      if (user) {
        // User exists, update fields if necessary
        const updates = {};

        // Always update auth0Id if it doesn't exist
        if (!user.auth0Id) {
          updates.auth0Id = auth0Id;
        }

        // Update lastLogin
        updates.lastLogin = lastLogin;

        // Conditionally update other fields if they're provided and different
        if (name && user.username !== name) {
          updates.username = name;
        } else if (username && user.username !== username) {
          updates.username = username;
        }

        if (email && user.email !== email) {
          updates.email = email;
        }

        if (avatar && user.avatar !== avatar) {
          updates.avatar = avatar;
        }

        // Only update if there are changes to make
        if (Object.keys(updates).length > 0) {
          user = await User.findByIdAndUpdate(
            user._id,
            { $set: updates },
            { new: true }
          ).select("-passwordHash");
        }
      } else {
        // Create a new user
        isNewUser = true;

        // Generate a secure random password that won't be used for login
        // (Auth0 will handle authentication)
        const randomPassword = Array(32)
          .fill(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*"
          )
          .map((x) => x[Math.floor(Math.random() * x.length)])
          .join("");

        user = new User({
          username: username || name || email.split("@")[0],
          email,
          auth0Id,
          passwordHash: randomPassword,
          avatar: avatar || null,
          lastLogin: lastLogin,
        });

        await user.save();
      }

      // Generate our own JWT token as backup
      const token = jwt.sign(
        { id: user._id, role: user.role, auth0Id: user.auth0Id },
        process.env.JWT_SECRET,
        { expiresIn: "70d" }
      );

      // Return user data
      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isNewUser: isNewUser,
      };

      res.status(200).json({
        success: true,
        message: isNewUser
          ? "User created successfully"
          : "User synced successfully",
        user: userResponse,
        token: token, // App's own JWT token
      });
    } catch (error) {
      console.error("Auth0 sync error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to sync Auth0 user",
        error: error.message,
      });
    }
  },
};

export default userController;

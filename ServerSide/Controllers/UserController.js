// controllers/userController.js
const asyncHandler = require("express-async-handler");
const { User } = require("../Models/User");

module.exports.updateBio = asyncHandler(async (req, res) => {
  const { bio } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    user.bio = bio;
    await user.save();
    res.status(200).json(bio);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports.getUserbyId = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports.searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      username: { $regex: query, $options: "i" }
    }).select("username profilePhoto followers following");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports.toggleFollow = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // Handle both legacy ObjectId arrays and new { user } objects
  const isFollowing = targetUser.followers.some(f => {
    if (f && f.user) {
      return f.user.toString() === currentUserId;
    }
    return f.toString() === currentUserId;
  });

  if (!isFollowing) {
    // Follow logic: push in new object shape
    targetUser.followers.push({ user: currentUserId });
    currentUser.following.push({ user: targetUserId });
    await Promise.all([targetUser.save(), currentUser.save()]);
    res.status(200).json({ message: "Followed user" });
  } else {
    // Unfollow logic: filter both shapes
    targetUser.followers = targetUser.followers.filter(f => {
      if (f && f.user) {
        return f.user.toString() !== currentUserId;
      }
      return f.toString() !== currentUserId;
    });
    currentUser.following = currentUser.following.filter(f => {
      if (f && f.user) {
        return f.user.toString() !== targetUserId;
      }
      return f.toString() !== targetUserId;
    });
    await Promise.all([targetUser.save(), currentUser.save()]);
    res.status(200).json({ message: "Unfollowed user" });
  }
});


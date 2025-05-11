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
  const targetUserId  = req.params.id;
  const currentUserId = req.user._id.toString();

  if (targetUserId === currentUserId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  // 1. Load both documents so we know their usernames & photos
  const [ targetUser, currentUser ] = await Promise.all([
    User.findById(targetUserId),
    User.findById(currentUserId)
  ]);
  if (!targetUser || !currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // 2. Check current state
  const isFollowing = targetUser.followers.some(f =>
    f.user.toString() === currentUserId
  );

  if (!isFollowing) {
    // 3a. FOLLOW: push full objects
    targetUser.followers.push({
      user:         currentUser._id,
      username:     currentUser.username,
      profilePhoto: currentUser.profilePhoto
    });
    currentUser.following.push({
      user:         targetUser._id,
      username:     targetUser.username,
      profilePhoto: targetUser.profilePhoto
    });
    await Promise.all([ targetUser.save(), currentUser.save() ]);
    return res.status(200).json({ message: "Followed user" });
  } else {
    // 3b. UNFOLLOW: filter out
    targetUser.followers = targetUser.followers.filter(
      f => f.user.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      f => f.user.toString() !== targetUserId
    );
    await Promise.all([ targetUser.save(), currentUser.save() ]);
    return res.status(200).json({ message: "Unfollowed user" });
  }
});


module.exports.toggleSavePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const idx = user.savedPosts.findIndex(id => id.toString() === postId);
  let message;
  if (idx === -1) {
    user.savedPosts.push(postId);
    message = 'Post saved';
  } else {
    user.savedPosts.splice(idx, 1);
    message = 'Post unsaved';
  }
  await user.save();
  res.status(200).json({ savedPosts: user.savedPosts, message });
});

module.exports.removeFollower = asyncHandler(async (req, res) => {
  const removeUserId  = req.params.id;         // the follower to remove
  const currentUserId = req.user._id.toString();

  const [ currentUser, removeUser ] = await Promise.all([
    User.findById(currentUserId),
    User.findById(removeUserId),
  ]);
  if (!currentUser || !removeUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // remove removeUser from currentUser.followers
  currentUser.followers = currentUser.followers.filter(
    f => f.user.toString() !== removeUserId
  );
  // also remove currentUser from removeUser.following
  removeUser.following = removeUser.following.filter(
    f => f.user.toString() !== currentUserId
  );

  await Promise.all([currentUser.save(), removeUser.save()]);

  res.status(200).json({ message: "Removed follower", followers: currentUser.followers });
});

module.exports.updateProfilePhoto = asyncHandler(async (req, res) => {
  const { url, publicId } = req.body;
  if (!url) {
    res.status(400);
    throw new Error("Photo URL is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.profilePhoto = { url, publicId: publicId || null };
  await user.save();

  res.status(200).json({
    profilePhoto: user.profilePhoto
  });
});
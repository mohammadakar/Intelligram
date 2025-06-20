// controllers/userController.js
const asyncHandler = require("express-async-handler");
const { User } = require("../Models/User");
const bcrypt = require("bcryptjs");
const { createNotification, deleteNotificationByCriteria } = require("./NotificationController");
const Chat = require("../Models/Chat");
const Story = require("../Models/Story");
const { Post } = require("../Models/Post");
const Notification = require("../Models/Notification");

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
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  // Fetch both users in parallel:
  const [targetUser, currentUser] = await Promise.all([
    User.findById(targetUserId),
    User.findById(currentUserId),
  ]);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // If there is already a pending request in targetUser.requests:
  const hasRequested = targetUser.requests.some(
    (r) => r.user.toString() === currentUserId
  );

  // If currentUser is already in targetUser.followers (fully following):
  const isFollowing = targetUser.followers.some(
    (f) => f.user.toString() === currentUserId
  );

  // If a request is pending, then “toggleFollow” should cancel that request:
  if (hasRequested && !isFollowing) {
    targetUser.requests = targetUser.requests.filter(
      (r) => r.user.toString() !== currentUserId
    );
    await targetUser.save();
    // Remove any outstanding “follow_request” notification:
    await deleteNotificationByCriteria({
      user: targetUserId,
      actor: currentUserId,
      type: "follow_request",
    });
    return res.status(200).json({ message: "Cancelled follow request" });
  }

  // If they already fully follow, toggle to unfollow:
  if (isFollowing) {
    targetUser.followers = targetUser.followers.filter(
      (f) => f.user.toString() !== currentUserId
    );
    currentUser.following = currentUser.following.filter(
      (f) => f.user.toString() !== targetUserId
    );
    await Promise.all([targetUser.save(), currentUser.save()]);
    return res.status(200).json({ message: "Unfollowed user" });
  }

  // Now we know: no pending request, and not already following.
  // If targetUser’s account is private → send a “follow request” instead of immediate follow:
  if (targetUser.isAccountPrivate) {
    targetUser.requests.push({
      user: currentUser._id,
      username: currentUser.username,
      profilePhoto: currentUser.profilePhoto,
    });
    await targetUser.save();

    // Create a “follow_request” notification → only that user sees it
    await createNotification({
      user: targetUserId,
      actor: currentUserId,
      type: "follow_request",
      reference: currentUserId, // reference = who’s requesting
      onModel: "User",
    });

    return res.status(200).json({ message: "Requested to follow" });
  }

  // Otherwise, if it’s a public account → immediately follow
  targetUser.followers.push({
    user: currentUser._id,
    username: currentUser.username,
    profilePhoto: currentUser.profilePhoto,
  });
  currentUser.following.push({
    user: targetUser._id,
    username: targetUser.username,
    profilePhoto: targetUser.profilePhoto,
  });
  await Promise.all([targetUser.save(), currentUser.save()]);

  // Create a plain “follow” notification
  await createNotification({
    user: targetUserId,
    actor: currentUserId,
    type: "follow",
    reference: targetUserId,
    onModel: "User",
  });

  return res.status(200).json({ message: "Followed user" });
});

//
// 2) New endpoint: respond to a pending follow request (accept/reject):
//
module.exports.respondFollowRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.requesterId; // the one who originally clicked “Request to follow”
  const { action } = req.body; // either "accept" or "reject"
  const currentUserId = req.user._id.toString();

  // Load both documents:
  const [currentUser, requesterUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(requesterId),
  ]);
  if (!currentUser || !requesterUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check that a request actually exists
  const hasReq = currentUser.requests.some(
    (r) => r.user.toString() === requesterId
  );
  if (!hasReq) {
    return res.status(400).json({ message: "No such follow request" });
  }

  // Remove from currentUser.requests in all cases:
  currentUser.requests = currentUser.requests.filter(
    (r) => r.user.toString() !== requesterId
  );

  if (action === "accept") {
    // Add to followers/following
    currentUser.followers.push({
      user: requesterUser._id,
      username: requesterUser.username,
      profilePhoto: requesterUser.profilePhoto,
    });
    requesterUser.following.push({
      user: currentUser._id,
      username: currentUser.username,
      profilePhoto: currentUser.profilePhoto,
    });

    // Save both
    await Promise.all([currentUser.save(), requesterUser.save()]);

    // Remove the original “follow_request” notification
    await deleteNotificationByCriteria({
      user: currentUserId,
      actor: requesterId,
      type: "follow_request",
    });

    // Create a “follow_accept” notification for the original requester
    await createNotification({
      user: requesterId,
      actor: currentUserId,
      type: "follow_accept",
      reference: currentUserId,
      onModel: "User",
    });

    return res.status(200).json({ message: "Follow request accepted" });
  } else if (action === "reject") {
    // Just remove the request and notify the requester that they were rejected
    await currentUser.save(); // we already removed from requests

    // Remove original “follow_request” notification
    await deleteNotificationByCriteria({
      user: currentUserId,
      actor: requesterId,
      type: "follow_request",
    });

    // Create a “follow_reject” notification for the original requester
    await createNotification({
      user: requesterId,
      actor: currentUserId,
      type: "follow_reject",
      reference: currentUserId,
      onModel: "User",
    });

    return res.status(200).json({ message: "Follow request rejected" });
  } else {
    return res.status(400).json({ message: "Invalid action" });
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

module.exports.updateProfile = asyncHandler(async (req, res) => {
  const { username, isAccountPrivate } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.username = username ?? user.username;
  user.isAccountPrivate = isAccountPrivate ?? user.isAccountPrivate;
  await user.save();
  const { password, ...rest } = user.toObject();
  res.json(rest); console.log(rest);
  
});

module.exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ message: "Password updated successfully" });
});


module.exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1) Delete all posts by this user
  await Post.deleteMany({ user: userId });

  // 2) Delete all stories by this user
  await Story.deleteMany({ user: userId });

  // 3) Remove this user from all other users' followers/following
  await User.updateMany(
    { "followers.user": userId },
    { $pull: { followers: { user: userId } } }
  );
  await User.updateMany(
    { "following.user": userId },
    { $pull: { following: { user: userId } } }
  );

  // 4) Delete all chats involving this user
  await Chat.deleteMany({ participants: userId });

  // 5) Delete all notifications where they are actor or recipient
  await Notification.deleteMany({
    $or: [
      { user: userId },
      { actor: userId },
      { reference: userId }
    ]
  });

  // 6) Finally delete the user record
  await User.findByIdAndDelete(userId);

  res.json({ message: "Your account and all related data have been deleted" });
});
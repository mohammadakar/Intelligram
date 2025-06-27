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

  const [targetUser, currentUser] = await Promise.all([
    User.findById(targetUserId),
    User.findById(currentUserId),
  ]);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const hasRequested = targetUser.requests.some(
    (r) => r.user.toString() === currentUserId
  );

  const isFollowing = targetUser.followers.some(
    (f) => f.user.toString() === currentUserId
  );

  if (hasRequested && !isFollowing) {
    targetUser.requests = targetUser.requests.filter(
      (r) => r.user.toString() !== currentUserId
    );
    await targetUser.save();

    await deleteNotificationByCriteria({
      user: targetUserId,
      actor: currentUserId,
      type: "follow_request",
    });
    return res.status(200).json({ message: "Cancelled follow request" });
  }

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

  if (targetUser.isAccountPrivate) {
    targetUser.requests.push({
      user: currentUser._id,
      username: currentUser.username,
      profilePhoto: currentUser.profilePhoto,
    });
    await targetUser.save();

    await createNotification({
      user: targetUserId,
      actor: currentUserId,
      type: "follow_request",
      reference: currentUserId, 
      onModel: "User",
    });

    return res.status(200).json({ message: "Requested to follow" });
  }

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

  await createNotification({
    user: targetUserId,
    actor: currentUserId,
    type: "follow",
    reference: targetUserId,
    onModel: "User",
  });

  return res.status(200).json({ message: "Followed user" });
});

module.exports.respondFollowRequest = asyncHandler(async (req, res) => {
  const requesterId = req.params.requesterId;
  const { action } = req.body; 
  const currentUserId = req.user._id.toString();

  const [currentUser, requesterUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(requesterId),
  ]);
  if (!currentUser || !requesterUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const hasReq = currentUser.requests.some(
    (r) => r.user.toString() === requesterId
  );
  if (!hasReq) {
    return res.status(400).json({ message: "No such follow request" });
  }

  currentUser.requests = currentUser.requests.filter(
    (r) => r.user.toString() !== requesterId
  );

  if (action === "accept") {
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

    await Promise.all([currentUser.save(), requesterUser.save()]);

    await deleteNotificationByCriteria({
      user: currentUserId,
      actor: requesterId,
      type: "follow_request",
    });

    await createNotification({
      user: requesterId,
      actor: currentUserId,
      type: "follow_accept",
      reference: currentUserId,
      onModel: "User",
    });

    return res.status(200).json({ message: "Follow request accepted" });
  } else if (action === "reject") {
    await currentUser.save();

    await deleteNotificationByCriteria({
      user: currentUserId,
      actor: requesterId,
      type: "follow_request",
    });

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
  const removeUserId  = req.params.id;       
  const currentUserId = req.user._id.toString();

  const [ currentUser, removeUser ] = await Promise.all([
    User.findById(currentUserId),
    User.findById(removeUserId),
  ]);
  if (!currentUser || !removeUser) {
    res.status(404);
    throw new Error("User not found");
  }

  currentUser.followers = currentUser.followers.filter(
    f => f.user.toString() !== removeUserId
  );

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

module.exports.sharePost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const alreadyShared = user.sharedPosts.some(id => id.toString() === postId);
  let message;
  
  if (alreadyShared) {
    user.sharedPosts = user.sharedPosts.filter(id => id.toString() !== postId);
    message = "Post unshared successfully";
  } else {
    user.sharedPosts.push(postId);
    message = "Post shared successfully";
  }

  await user.save();

  if (!alreadyShared) {
    await createNotification({
      user: post.user,
      actor: userId,
      type: "share",
      reference: postId,
      onModel: "Post"
    });
  }

  res.status(200).json({ 
    message,
    sharedPosts: user.sharedPosts 
  });
});

module.exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Post.deleteMany({ user: userId });

  await Post.updateMany(
    { "comments.user": userId },
    { $pull: { comments: { user: userId } } }
  );

  await Story.deleteMany({ user: userId });

  await User.updateMany(
    { "followers.user": userId },
    { $pull: { followers: { user: userId } } }
  );
  await User.updateMany(
    { "following.user": userId },
    { $pull: { following: { user: userId } } }
  );

  await Chat.deleteMany({ participants: userId });

  await Notification.deleteMany({
    $or: [
      { user: userId },
      { actor: userId },
      { reference: userId }
    ]
  });

  await User.findByIdAndDelete(userId);

  res.json({ message: "Your account and all related data have been deleted" });
});
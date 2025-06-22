// controllers/adminController.js
const asyncHandler = require('express-async-handler');
const { User }     = require('../Models/User');
const { Post }     = require('../Models/Post');
const Story        = require('../Models/Story');
const Report       = require('../Models/Report');
const { createNotification } = require('./NotificationController');
const Notification = require('../Models/Notification');

// ─── 1) Users ─────────────────────────────────────────────────────────────

module.exports.listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('username profilePhoto warnings isAdmin')
    .lean();
  res.json(users);
});

module.exports.makeAdmin = asyncHandler(async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: "User not found" });
  u.isAdmin = true;
  await u.save();
  res.json({ message: "User promoted to admin" });
});

module.exports.deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// ─── 2) Posts ─────────────────────────────────────────────────────────────

module.exports.listPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('user', 'username profilePhoto')
    .select('caption media createdAt comments likes user')
    .lean();
  res.json(posts);
});

module.exports.deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  // delete post
  await Post.findByIdAndDelete(postId);

  // cascade deletes
  await Notification.deleteMany({ reference: postId, type: { $in: ["like","comment"] }});
  await Report.deleteMany({ referenceId: postId, type: "post" });

  res.json({ message: "Post deleted" });
});

module.exports.deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  post.comments.id(req.params.commentId).remove();
  await post.save();
  res.json({ message: "Comment deleted" });
});

// ─── 3) Reports ───────────────────────────────────────────────────────────

module.exports.listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'username profilePhoto')
    .lean();
  res.json(reports);
});

module.exports.warnReport = asyncHandler(async (req, res) => {
  const r = await Report.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });

  // 1) figure out the owner and media URL
  let ownerId, mediaUrl, violType;
  if (r.type === "post") {
    const post = await Post.findById(r.referenceId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    ownerId  = post.user;
    mediaUrl  = post.media[0];
    violType = "post";
    // also delete the post
    await Post.findByIdAndDelete(r.referenceId);
  } else { /* story */
    const story = await Story.findById(r.referenceId);
    if (!story) return res.status(404).json({ message: "Story not found" });
    ownerId  = story.user;
    mediaUrl  = story.url;
    violType = "story";
    // delete story
    await Story.findByIdAndDelete(r.referenceId);
  }

  // 2) increment their warning count
  const user = await User.findById(ownerId);
  user.warnings = (user.warnings || 0) + 1;
  await user.save();

  // 3) send the “warning” notification
  await createNotification({
    user:      ownerId,
    actor:     req.user._id,
    type:      "warning",
    reference: r.referenceId,
    mediaUrl
  });

  return res.json({
    message:        "User warned",
    warningsCount:  user.warnings
  });
});

// ─── 4) Stories ───────────────────────────────────────────────────────────

module.exports.listStories = asyncHandler(async (req, res) => {
  const stories = await Story.find()
    .populate('user', 'username profilePhoto')
    .select('user url type createdAt')
    .lean();
  res.json(stories);
});

module.exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findByIdAndDelete(req.params.id);
  if (!story) return res.status(404).json({ message: 'Story not found' });

  await Report.deleteMany({ referenceId:req.params.id, type: "story" });
  res.json({ message: 'Story deleted' });
});

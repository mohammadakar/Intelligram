const asyncHandler = require('express-async-handler');
const { User }     = require('../Models/User');
const { Post }     = require('../Models/Post');
const Story        = require('../Models/Story');
const Report       = require('../Models/Report');
const { createNotification } = require('./NotificationController');
const Notification = require('../Models/Notification');
const Chat         = require('../Models/Chat');

//Users
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
  const userId = req.params.id;
  
  const userPosts = await Post.find({ user: userId }).select('_id');
  const postIds = userPosts.map(p => p._id);
  
  const userStories = await Story.find({ user: userId }).select('_id');
  const storyIds = userStories.map(s => s._id);

  await Promise.all([
    User.findByIdAndDelete(userId),
    Notification.deleteMany({ 
      $or: [{ user: userId }, { actor: userId }] 
    }),
    
    Post.deleteMany({ user: userId }),
    Story.deleteMany({ user: userId }),

    Post.updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } }
    ),

    Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    ),
    Story.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    ),

    Report.deleteMany({ reporter: userId }),
    Report.deleteMany({ 
      $or: [
        { referenceId: { $in: postIds }, type: "post" },
        { referenceId: { $in: storyIds }, type: "story" }
      ]
    }),

    Chat.deleteMany({
      $or: [
        { participants: userId },
        { groupAdmin: userId }
      ]
    })
  ]);

  res.json({ message: "User and all related data deleted successfully" });
});

//Posts
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

  await Promise.all([
    Post.findByIdAndDelete(postId),
    Notification.deleteMany({ 
      reference: postId, 
      type: { $in: ["like", "comment"] } 
    }),
    Report.deleteMany({ 
      referenceId: postId, 
      type: "post" 
    })
  ]);

  res.json({ message: "Post and all related data deleted" });
});

module.exports.deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  post.comments.id(req.params.commentId).remove();
  await post.save();
  res.json({ message: "Comment deleted" });
});

//Reports
module.exports.listReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate('reporter', 'username profilePhoto')
    .lean();
  res.json(reports);
});

module.exports.warnReport = asyncHandler(async (req, res) => {
  const r = await Report.findById(req.params.id);
  if (!r) return res.status(404).json({ message: "Report not found" });

  let ownerId, mediaUrl, violType;
  if (r.type === "post") {
    const post = await Post.findById(r.referenceId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    ownerId  = post.user;
    mediaUrl  = post.media[0];
    violType = "post";
    await Promise.all([
      Post.findByIdAndDelete(r.referenceId),
      Notification.deleteMany({ 
        reference: r.referenceId, 
        type: { $in: ["like", "comment"] } 
      }),
      Report.deleteMany({ 
        referenceId: r.referenceId, 
        type: "post" 
      })
    ]);
  } else { //story
    const story = await Story.findById(r.referenceId);
    if (!story) return res.status(404).json({ message: "Story not found" });
    ownerId  = story.user;
    mediaUrl  = story.url;
    violType = "story";
    // Delete story and reports
    await Promise.all([
      Story.findByIdAndDelete(r.referenceId),
      Report.deleteMany({ 
        referenceId: r.referenceId, 
        type: "story" 
      })
    ]);
  }

  const user = await User.findById(ownerId);
  user.warnings = (user.warnings || 0) + 1;
  await user.save();

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


//Stories
module.exports.listStories = asyncHandler(async (req, res) => {
  const stories = await Story.find()
    .populate('user', 'username profilePhoto')
    .select('user url type createdAt')
    .lean();
  res.json(stories);
});

module.exports.deleteStory = asyncHandler(async (req, res) => {
  const storyId = req.params.id;
  
  await Promise.all([
    Story.findByIdAndDelete(storyId),
    Report.deleteMany({ 
      referenceId: storyId, 
      type: "story" 
    })
  ]);
  
  res.json({ message: 'Story and all related reports deleted' });
});
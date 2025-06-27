const asyncHandler = require('express-async-handler');
const Story       = require('../Models/Story');
const Report      = require('../Models/Report');
const Notification= require('../Models/Notification');
const { User }    = require('../Models/User');

module.exports.createStories = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const incoming = req.body.stories; 

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: 'No stories provided' });
  }

  const docs = incoming.map(s => ({
    user:     userId,
    url:      s.url,
    type:     s.type.startsWith('video') ? 'video' : 'image',
    caption:  s.caption || '',
    location: s.location || '',
    tags:     Array.isArray(s.tags) ? s.tags : []
  }));

  const created = await Story.insertMany(docs);
  res.status(201).json(created);
});

module.exports.getStories = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const meDoc = await User.findById(me).select('following');
  const followIds = meDoc.following.map(f => f.user.toString()).concat(me.toString());

  const stories = await Story.find({ user: { $in: followIds } })
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePhoto')
    .populate('tags', 'username') 
    .exec();

  res.json(stories);
});

module.exports.toggleLikeStory = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const story  = await Story.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }

  const already = story.likes.some(id => id.toString() === userId);
  if (already) {
    story.likes = story.likes.filter(id => id.toString() !== userId);
  } else {
    story.likes.push(req.user._id);
  }
  await story.save();

  await Notification.create({
    user: story.user,
    actor: req.user._id,
    type: "story_like",
    reference: story._id
  });

  res.json({ likes: story.likes });
});

module.exports.viewStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  const uid = req.user._id.toString();
  if (!story.views.some(v => v.user.toString() === uid)) {
    story.views.push({ user: req.user._id });
    await story.save();
  }
  res.json({ message: "View recorded" });
});

module.exports.getStoryViews = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id)
    .populate("views.user", "username profilePhoto");
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  res.json(story.views.map(v => ({
    _id:         v.user._id,
    username:    v.user.username,
    profilePhoto:v.user.profilePhoto,
    viewedAt:    v.viewedAt
  })));
});

module.exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error("Story not found");
  }
  if (story.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this story");
  }

  await Report.deleteMany({ referenceId: story._id, type: 'story' });

  await Notification.deleteMany({ reference: story._id, type: { $in: ['story_like','story_report'] } });

  await story.deleteOne();

  res.json({ message: 'Story deleted' });
});

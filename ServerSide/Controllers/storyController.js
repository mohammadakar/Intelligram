const asyncHandler = require('express-async-handler');
const Story       = require('../Models/Story');
const { User } = require('../Models/User');
const { createNotification } = require('./NotificationController');

module.exports.createStories = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const incoming = req.body.stories; 
  // expected: [ { url, type, caption, location, tags: [...userIds] }, ... ]

  if (!Array.isArray(incoming) || incoming.length === 0) {
    return res.status(400).json({ error: 'No stories provided' });
  }

  // build Story docs
  const docs = incoming.map(s => ({
    user:     userId,
    url:      s.url,
    type:     s.type,
    caption:  s.caption || '',
    location: s.location || '',
    tags:     Array.isArray(s.tags) ? s.tags : []
  }));

  // insertMany so that createdAt is set on each one
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
  await createNotification({
  user: story.user,
  actor: userId,
  type: "story_like",
  reference: story._id
});
  res.json({ likes: story.likes });
});

module.exports.viewStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id)
  if (!story) {
    res.status(404)
    throw new Error("Story not found")
  }
  const uid = req.user._id.toString()
  // only record once
  if (!story.views.some(v => v.user.toString() === uid)) {
    story.views.push({ user: req.user._id })
    await story.save()
  }
  res.json({ message: "View recorded" })
})

// return list of users who viewed story :id
module.exports.getStoryViews = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id)
    .populate("views.user", "username profilePhoto")
  if (!story) {
    res.status(404)
    throw new Error("Story not found")
  }
  res.json(story.views.map(v => ({
    _id:        v.user._id,
    username:   v.user.username,
    profilePhoto: v.user.profilePhoto,
    viewedAt:   v.viewedAt
  })))
})
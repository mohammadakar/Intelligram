const asyncHandler = require('express-async-handler');
const Story       = require('../Models/Story');
const { User } = require('../Models/User');

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

const { Post } = require("../Models/Post");
const asyncHandler = require("express-async-handler");

module.exports.createPost =asyncHandler( async (req, res) => {
  try {
    const post = new Post({
      user: req.user._id,
      caption: req.body.caption,
      location: req.body.location,
      tags: req.body.tags,
      media: req.body.media
    });
    
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

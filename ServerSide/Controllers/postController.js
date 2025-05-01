const { Post } = require("../Models/Post");
const asyncHandler = require("express-async-handler");
const { User } = require("../Models/User");

module.exports.createPost = asyncHandler(async (req, res) => {
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

module.exports.getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePhoto isAccountPrivate')
      .populate('comments.user', 'username profilePhoto');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.getPostById = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.toggleLike = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
  if (!alreadyLiked) {
    post.likes.push(userId);
  } else {
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
  }

  await post.save();
  res.status(200).json({ likes: post.likes });
});

module.exports.addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  
  post.comments.push({
    text,
    user: req.user._id,
    createdAt: new Date()
  });
  await post.save();

  
  await post.populate({
    path: "comments.user",
    select: "username profilePhoto",
    model: User  
  });

  
  const newComment = post.comments[post.comments.length - 1];

  
  res.status(201).json(newComment);
});

module.exports.getPostComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("comments.user", "username profilePhoto");
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  res.status(200).json(post.comments);
});


module.exports.editComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  
  if (comment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to edit this comment");
  }
  comment.text = text;
  await post.save();
  
  await post.populate('comments.user', 'username profilePhoto');
  const updated = post.comments.id(req.params.commentId);
  res.json(updated);
});

module.exports.deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  
  if (
    comment.user.toString() !== req.user._id.toString() &&
    post.user.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }
  comment.deleteOne();
  await post.save();
  res.json({ commentId: req.params.commentId });
});

module.exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  
  if (
    post.user.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this post");
  }

  await post.deleteOne();
  res.status(200).json({ message: "Post deleted successfully", postId: req.params.id });
});
const express = require("express");
const router = express.Router();
const { Protect } = require("../Middlewares/authMiddleware");
const {
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
  addComment,
  getPostComments,
  editComment,
  deleteComment,
  deletePost
} = require("../Controllers/postController");

router.post("/create-post", Protect, createPost);
router.get("/getAllPosts", getAllPosts);
router.get("/getPost/:id", getPostById);
router.post("/:id/like", Protect, toggleLike);
router.post("/:id/comment", Protect, addComment);
router.get("/:id/comments", getPostComments);
router.put('/:id/comment/:commentId', Protect, editComment);
router.delete('/:id/comment/:commentId', Protect, deleteComment);
router.delete('/:id', Protect, deletePost);

module.exports = router;

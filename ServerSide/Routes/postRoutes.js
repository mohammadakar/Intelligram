const { createPost, getAllPosts, getPostById } = require('../Controllers/postController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();

router.post("/create-post",Protect,createPost);
router.get('/getAllPosts', getAllPosts);
router.get('/getPost/:id', Protect, getPostById);

module.exports = router;

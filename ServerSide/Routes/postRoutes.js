const { createPost, getAllPosts } = require('../Controllers/postController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();

router.post("/create-post",Protect,createPost);
router.get('/getAllPosts', getAllPosts);

module.exports = router;

const router = require('express').Router();
const { Protect } = require('../Middlewares/authMiddleware');
const { getStories, createStories, toggleLikeStory, viewStory, getStoryViews } = require('../Controllers/storyController');

router.get('/', Protect, getStories);
router.post('/', Protect, createStories);
router.post("/:id/like",  Protect, toggleLikeStory);
router.post("/:id/view",   Protect, viewStory);
router.get("/:id/views",   Protect, getStoryViews);

module.exports = router;

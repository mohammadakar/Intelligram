const router = require('express').Router();
const { getStories, createStories, toggleLikeStory, viewStory, getStoryViews, deleteStory } = require('../Controllers/storyController');
const { Protect } = require('../Middlewares/authMiddleware');


router.get('/',        Protect, getStories);
router.post('/',       Protect, createStories);
router.post('/:id/like',Protect, toggleLikeStory);
router.post('/:id/view',Protect, viewStory);
router.get('/:id/views',Protect, getStoryViews);
router.delete('/:id',  Protect, deleteStory);

module.exports = router;

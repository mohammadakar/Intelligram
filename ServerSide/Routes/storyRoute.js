const router = require('express').Router();
const { Protect } = require('../Middlewares/authMiddleware');
const { getStories, createStories } = require('../Controllers/storyController');

router.get('/', Protect, getStories);
router.post('/', Protect, createStories);

module.exports = router;

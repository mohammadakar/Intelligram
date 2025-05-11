const { updateBio, getUserbyId, searchUsers, toggleFollow, toggleSavePost, removeFollower, updateProfilePhoto } = require('../Controllers/UserController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();

router.post("/update-bio", Protect, updateBio);
router.get("/getUserbyId/:id", getUserbyId);
router.get('/search', searchUsers);
router.put('/toggle-follow/:id', Protect, toggleFollow);
router.put('/save-post/:postId', Protect, toggleSavePost);
router.delete("/remove-follower/:id", Protect, removeFollower);
router.put('/profile-photo', Protect, updateProfilePhoto);

module.exports = router;

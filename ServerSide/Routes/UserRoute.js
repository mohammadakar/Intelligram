const { updateBio, getUserbyId, searchUsers, toggleFollow, toggleSavePost, removeFollower, updateProfilePhoto, updateProfile, updatePassword, deleteAccount, respondFollowRequest, sharePost } = require('../Controllers/UserController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();

router.post("/update-bio", Protect, updateBio);
router.get("/getUserbyId/:id", getUserbyId);
router.get('/search', searchUsers);
router.put('/toggle-follow/:id', Protect, toggleFollow);
router.put('/save-post/:postId', Protect, toggleSavePost);
router.put("/respond-follow/:requesterId", Protect, respondFollowRequest);
router.delete("/remove-follower/:id", Protect, removeFollower);
router.put('/profile-photo', Protect, updateProfilePhoto);
router.put("/update-profile", Protect, updateProfile);
router.put("/update-password", Protect, updatePassword);
router.delete("/delete-account", Protect, deleteAccount);
router.put('/share-post/:postId', Protect, sharePost);
router.get("/get-me", Protect, (req, res) => {
  const { password, ...rest } = req.user.toObject();
  res.json(rest);
});

module.exports = router;

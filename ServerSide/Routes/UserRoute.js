const { updateBio, getUserbyId, searchUsers, toggleFollow } = require('../Controllers/UserController');
const { Protect } = require('../Middlewares/authMiddleware');

const router = require('express').Router();

router.post("/update-bio", Protect, updateBio);
router.get("/getUserbyId/:id", getUserbyId);
router.get('/search', searchUsers);
router.put('/toggle-follow/:id', Protect, toggleFollow);

module.exports = router;

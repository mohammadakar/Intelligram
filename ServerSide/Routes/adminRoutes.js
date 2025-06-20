const router     = require('express').Router();
const { warnReport, listReports, deleteComment, deletePost, listPosts, deleteUser, makeAdmin, listUsers, listStories, deleteStory } = require('../Controllers/AdminController');
const { Protect } = require('../Middlewares/authMiddleware');
const isAdmin    = require('../Middlewares/isAdmin');

router.use(Protect, isAdmin);

router.get('/users',listUsers);
router.put('/users/:id/make-admin',makeAdmin);
router.delete('/users/:id',deleteUser);

router.get('/posts',listPosts);
router.delete('/posts/:id',deletePost);
router.delete('/posts/:postId/comments/:commentId',deleteComment);

router.get('/stories', listStories);
router.delete('/stories/:id', deleteStory);

router.get('/reports',listReports);
router.put('/reports/:id/warn',warnReport);

module.exports = router;

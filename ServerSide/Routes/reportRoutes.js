const router = require('express').Router();
const { Protect } = require('../Middlewares/authMiddleware');
const { createReport, listReports } = require('../Controllers/reportController');
const isAdmin = require('../Middlewares/isAdmin');

router.post('/', Protect, createReport);
router.get('/', Protect, isAdmin, listReports);

module.exports = router;

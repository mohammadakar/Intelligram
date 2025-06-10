const express = require("express");
const { Protect } = require("../Middlewares/authMiddleware");
const { listNotifications, markAllRead } = require("../Controllers/NotificationController");
const router = express.Router();

router.get("/", Protect, listNotifications);
router.put("/mark-read", Protect, markAllRead);

module.exports = router;

const asyncHandler = require("express-async-handler");
const Notification = require("../Models/Notification");

module.exports.createNotification = asyncHandler(async ({ user, actor, type, reference }) => {
  const notif = await Notification.create({ user, actor, type, reference });
  const io = require("../socket").getIO();
  io.to(user.toString()).emit("notification", notif);
  return notif;
});

module.exports.deleteNotificationByCriteria = asyncHandler(async (criteria) => {
  await Notification.deleteMany(criteria);
  return;
});

module.exports.listNotifications = asyncHandler(async (req, res) => {
  const list = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("actor","username profilePhoto warnings");
  res.json(list);
});

module.exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
});

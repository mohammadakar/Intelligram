const asyncHandler = require('express-async-handler');
const Chat = require('../Models/Chat');

exports.getOrCreateChat = asyncHandler(async (req, res) => {
  const me = req.user._id.toString();
  const other = req.params.otherId;
  let chat = await Chat.findOne({
    participants: { $all: [me, other] }
  })
  .populate('participants', 'username profilePhoto')
  .populate('messages.sender', 'username profilePhoto');

  if (!chat) {
    chat = await Chat.create({ participants: [me, other], messages: [] });
    chat = await Chat.findById(chat._id)
      .populate('participants', 'username profilePhoto')
      .populate('messages.sender', 'username profilePhoto');
  }

  res.json(chat);
});

// POST a new message
exports.sendMessage = asyncHandler(async (req, res) => {
  const { type, content } = req.body;
  if (!type || !content) {
    res.status(400);
    throw new Error('type and content are required');
  }
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }
  const msg = {
    type,
    content,
    sender: req.user._id
  };
  chat.messages.push(msg);
  await chat.save();

  // re-populate the sender field
  const updated = await Chat.findById(chat._id)
    .populate('participants', 'username profilePhoto')
    .populate('messages.sender', 'username profilePhoto');

  res.json(updated);
});

// GET all chats for current user (for list of previous chats)
exports.listMyChats = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const chats = await Chat.find({ participants: me })
    .sort({ updatedAt: -1 })
    .populate('participants', 'username profilePhoto')
    .populate('messages.sender', 'username profilePhoto');
  res.json(chats);
});

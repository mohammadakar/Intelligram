const asyncHandler = require('express-async-handler');
const Chat = require('../Models/Chat');

// Utility to always return a fully populated chat
async function fetchPopulatedChat(chatId) {
  return Chat.findById(chatId)
    .populate('participants', 'username profilePhoto')
    .populate('messages.sender', 'username profilePhoto')
    .exec();
}

module.exports.getOrCreateChat = asyncHandler(async (req, res) => {
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
module.exports.sendMessage = asyncHandler(async (req, res) => {
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
module.exports.listMyChats = asyncHandler(async (req, res) => {
  const me = req.user._id;
  const chats = await Chat.find({ participants: me })
    .sort({ updatedAt: -1 })
    .populate('participants', 'username profilePhoto')
    .populate('messages.sender', 'username profilePhoto');
  res.json(chats);
});

module.exports.updateMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('content is required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const msg = chat.messages.id(messageId);
  if (!msg) {
    res.status(404);
    throw new Error('Message not found');
  }
  if (msg.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this message');
  }

  msg.content = content;
  msg.editedAt = new Date();
  await chat.save();

  // re-fetch and return updated message
  const populated = await fetchPopulatedChat(chatId);
  const updatedMsg = populated.messages.id(messageId);
  res.json(updatedMsg);
});

// delete message (unsend)
module.exports.deleteMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).throw(new Error('Chat not found'));

  const msg = chat.messages.id(req.params.messageId);
  if (!msg) return res.status(404).throw(new Error('Message not found'));
  if (msg.sender.toString() !== req.user._id.toString())
    return res.status(403).throw(new Error('Not authorized'));

  msg.deleteOne();
  await chat.save();
  res.json({ messageId: req.params.messageId });
});

// delete chat (just for you)
module.exports.deleteChat = asyncHandler(async (req, res) => {
  // Option A: remove participant only
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).throw(new Error('Chat not found'));
  chat.participants = chat.participants.filter(p => p.toString() !== req.user._id.toString());
  await chat.save();
  res.json({ chatId: req.params.chatId });
});
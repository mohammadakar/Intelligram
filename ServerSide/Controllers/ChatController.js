// Controllers/ChatController.js
const asyncHandler = require('express-async-handler');
const Chat         = require('../Models/Chat');

// List all chats for current user
module.exports.listMyChats = asyncHandler(async (req, res) => {
  const me = req.user._id;
  let chats = await Chat.find({ participants: me })
    .populate('participants', 'username profilePhoto')
    .populate('messages.sender', 'username profilePhoto')
    .sort({ updatedAt: -1 });
  res.json(chats);
});

// Get or create one‐to‐one chat
module.exports.getOrCreateChat = asyncHandler(async (req, res) => {
  const me    = req.user._id.toString();
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

// Send a message (text, image, or video)
module.exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId }        = req.params;
  const { content = '', mediaUrl = '' } = req.body;

  if (!content.trim() && !mediaUrl) {
    res.status(400);
    throw new Error('Either content or mediaUrl is required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  // Determine type
  let type = 'text';
  if (mediaUrl) {
    if (/\.(mp4|mov|avi|webm)$/i.test(mediaUrl)) type = 'video';
    else type = 'image';
  }

  chat.messages.push({
    sender:  req.user._id,
    type,
    content: content.trim(),
    media:   mediaUrl
  });
  await chat.save();

  // Re-populate
  await chat.populate([
    { path: 'participants', select: 'username profilePhoto' },
    { path: 'messages.sender', select: 'username profilePhoto' }
  ]);

  // Return the newly added message
  const last = chat.messages[chat.messages.length - 1];
  res.status(201).json(last);
});

// Edit a message
module.exports.updateMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { content }           = req.body;
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
    throw new Error('Not authorized');
  }
  msg.content = content;
  await chat.save();
  await chat.populate('messages.sender', 'username profilePhoto');
  res.json(msg);
});

// Delete (unsend) a message
module.exports.deleteMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;
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
    throw new Error('Not authorized');
  }
  msg.remove();
  await chat.save();
  res.json({ message: 'Message deleted' });
});

// Delete an entire chat
module.exports.deleteChat = asyncHandler(async (req, res) => {
  await Chat.findByIdAndDelete(req.params.chatId);
  res.json({ message: 'Chat deleted' });
});

const asyncHandler = require('express-async-handler');
const Chat         = require('../Models/Chat');

module.exports.listMyChats = asyncHandler(async (req, res) => {
  const me = req.user._id;
  let chats = await Chat.find({ participants: me })
    .populate('participants', 'username profilePhoto')
    .populate('messages.sender', 'username profilePhoto')
    .sort({ updatedAt: -1 });
  res.json(chats);
});

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

module.exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId }        = req.params;
  const { content = '', media = [], type } = req.body;

  if (!content.trim() && media.length === 0 && type !== 'audio') {
    res.status(400);
    throw new Error('Message content or media is required');
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  let actualType = type;
  if (!actualType && media.length > 0) {
    const isVideo = media.some(url => /\.(mp4|mov|avi|webm)$/i.test(url));
    const isImage = media.some(url => /\.(jpg|jpeg|png|gif)$/i.test(url));
    const isAudio = media.some(url => /\.(mp3|wav|ogg)$/i.test(url));
    
    if (isVideo) actualType = 'video';
    else if (isImage) actualType = 'image';
    else if (isAudio) actualType = 'audio';
    else actualType = 'file';
  } else if (!actualType) {
    actualType = 'text';
  }

  const newMessage = {
    sender:  req.user._id,
    type: actualType,
    content: content.trim(),
    media: media
  };

  chat.messages.push(newMessage);
  await chat.save();

  await chat.populate([
    { path: 'participants', select: 'username profilePhoto' },
    { path: 'messages.sender', select: 'username profilePhoto' }
  ]);

  const lastMessage = chat.messages[chat.messages.length - 1];
  res.status(201).json(lastMessage);
});

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
  msg.deleteOne();
  await chat.save();
  res.json({ message: 'Message deleted' });
});

module.exports.deleteChat = asyncHandler(async (req, res) => {
  await Chat.findByIdAndDelete(req.params.chatId);
  res.json({ message: 'Chat deleted' });
});

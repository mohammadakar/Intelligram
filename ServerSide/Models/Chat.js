const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new mongoose.Schema({
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:     { type: String, required: function() { return !this.media?.length; } },
  media:       { type: [String], default: [] }, 
  type:        { type: String, enum: ['text','image','video'], required: true },
  createdAt:   { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages:     [ messageSchema ]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:     { type: String, required: function() { 
    return !this.media?.length && this.type !== 'audio'; 
  } },
  media:       { type: [String], default: [] },    
  type:        { 
    type: String, 
    enum: ['text','image','video','audio','file'], 
    required: true 
  },
  createdAt:   { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages:     [ messageSchema ]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
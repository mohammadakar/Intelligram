const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
  },
  caption: String,
  location: String,
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
  }],
  media: [{ 
    type: String, required: true  
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('post', postSchema);

module.exports = {Post};

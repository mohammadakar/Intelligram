const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image','video'],
    required: true
  },
  // new fields:
  caption: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24   // stories auto-expire after 1 day
  },
  likes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  views:[viewSchema],
});

const Story = mongoose.model('Story', storySchema);
module.exports = Story;

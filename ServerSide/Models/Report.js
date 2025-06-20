const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['post','story'], required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);


module.exports = Report;

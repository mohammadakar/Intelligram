const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  actor:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },                   
  type:        { type: String, enum: ["message","like","comment","follow","follow_request","follow_accept","follow_reject","story_like","admin"], required: true },
  reference:   { type: mongoose.Schema.Types.ObjectId },                                
  read:        { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;

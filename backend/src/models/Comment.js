const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  },
  appId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: {
    type: Array,
    default: []
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('Comment', commentSchema);

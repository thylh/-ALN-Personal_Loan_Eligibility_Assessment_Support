const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'notif_' + Date.now()
  },
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  loanId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('Notification', notificationSchema);

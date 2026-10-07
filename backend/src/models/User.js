const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  },
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'credit_officer', 'admin', 'accountant', 'collection'],
    default: 'customer'
  },
  occupation: {
    type: String,
    enum: ['STUDENT', 'EMPLOYED', 'BUSINESS_OWNER', 'FREELANCER', 'OTHER'],
    default: 'OTHER'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  identityCard: {
    type: String,
    default: '',
    trim: true
  },
  bankName: {
    type: String,
    default: 'Vietcombank (Ngân hàng Ngoại Thương)',
    trim: true
  },
  accountNumber: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('User', userSchema);

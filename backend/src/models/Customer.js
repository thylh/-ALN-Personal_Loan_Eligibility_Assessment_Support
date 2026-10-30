const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    index: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  identityCard: {
    type: String,
    default: '',
    index: true
  },
  occupation: {
    type: String,
    enum: ['STUDENT', 'EMPLOYED', 'BUSINESS_OWNER', 'FREELANCER', 'OTHER'],
    default: 'OTHER'
  },
  personalDetails: {
    fullName: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: 'Nam' },
    educationLevel: { type: String, default: '' },
    maritalStatus: { type: String, default: '' },
    dependents: { type: Number, default: 0 },
    address: { type: String, default: '' }
  },
  financialDetails: {
    grossMonthlyIncome: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    existingMonthlyDebt: { type: Number, default: 0 },
    workTenureYears: { type: Number, default: 0 },
    employerName: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    creditHistoryScore: { type: Number, default: 80 }
  },
  defaultDisbursementBank: {
    type: String,
    default: ''
  },
  defaultDisbursementAccount: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'customers'
});

module.exports = mongoose.model('Customer', customerSchema);

const mongoose = require('mongoose');

const loanProductSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  targetOccupations: [{
    type: String
  }],
  minAmount: {
    type: Number,
    required: true
  },
  maxAmount: {
    type: Number,
    required: true
  },
  defaultAmount: {
    type: Number,
    default: 20000000
  },
  stepAmount: {
    type: Number,
    default: 1000000
  },
  minTerm: {
    type: Number,
    required: true
  },
  maxTerm: {
    type: Number,
    required: true
  },
  defaultTerm: {
    type: Number,
    default: 12
  },
  interestRate: {
    type: Number,
    required: true
  },
  rateType: {
    type: String,
    default: 'FIXED'
  },
  calcMethod: {
    type: String,
    enum: ['reducing', 'flat'],
    default: 'reducing'
  },
  badge: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
    default: ''
  },
  benefits: [{
    type: String
  }],
  eligibilityCriteria: [{
    type: String
  }],
  requiredDocs: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoanProduct', loanProductSchema);

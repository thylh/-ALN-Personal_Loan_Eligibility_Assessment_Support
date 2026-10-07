const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'app_' + Date.now()
  },
  applicationNo: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    default: ''
  },
  identityCard: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: 'OTHER'
  },
  productId: {
    type: String,
    default: ''
  },
  productName: {
    type: String,
    default: ''
  },
  requestedAmount: {
    type: Number,
    required: true
  },
  requestedTermMonths: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    default: 0.85
  },
  loanPurpose: {
    type: String,
    default: ''
  },
  disbursementBank: {
    type: String,
    default: ''
  },
  disbursementAccount: {
    type: String,
    default: ''
  },
  approvedAmount: {
    type: Number,
    default: 0
  },
  disbursedAmount: {
    type: Number,
    default: 0
  },
  remainingPrincipal: {
    type: Number,
    default: 0
  },
  paidMonths: {
    type: Number,
    default: 0
  },
  totalPaidAmount: {
    type: Number,
    default: 0
  },
  contract: {
    contractId: { type: String, default: '' },
    signedAt: { type: String, default: '' },
    status: { type: String, default: 'PENDING_REVIEW' }, // PENDING_REVIEW, SIGNED, ACTIVE
    disbursementBank: { type: String, default: '' },
    disbursementAccount: { type: String, default: '' }
  },
  personalDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  financialDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  documents: [{
    type: mongoose.Schema.Types.Mixed
  }],
  scoringResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'APPROVED', 'REJECTED', 'DISBURSED'],
    default: 'SUBMITTED'
  },
  version: {
    type: Number,
    default: 1
  },
  appraisalNote: {
    type: String,
    default: ''
  },
  actionRequiredReason: {
    type: String,
    default: ''
  },
  auditLogs: [{
    action: String,
    performedBy: String,
    role: String,
    timestamp: String,
    note: String
  }]
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);

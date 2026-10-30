const mongoose = require('mongoose');

const loanAuditLogSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  },
  applicationId: {
    type: String,
    required: true,
    ref: 'LoanApplication',
    index: true
  },
  applicationNo: {
    type: String,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'system'
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString()
  },
  note: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'loan_audit_logs'
});

module.exports = mongoose.model('LoanAuditLog', loanAuditLogSchema);

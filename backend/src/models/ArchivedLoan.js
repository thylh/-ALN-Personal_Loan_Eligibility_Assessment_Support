const mongoose = require('mongoose');

const archivedLoanSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  applicationNo: {
    type: String,
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  identityCard: {
    type: String,
    default: ''
  },
  requestedAmount: {
    type: Number,
    default: 0
  },
  requestedTermMonths: {
    type: Number,
    default: 12
  },
  status: {
    type: String,
    default: 'ARCHIVED'
  },
  scoringResult: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  originalCreatedAt: {
    type: Date
  },
  archivedAt: {
    type: Date,
    default: Date.now
  },
  archivedReason: {
    type: String,
    default: 'Exceeded active queue sliding window (max 100 loans / 10 pages)'
  },
  fullDataSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'archived_loans'
});

module.exports = mongoose.model('ArchivedLoan', archivedLoanSchema);


const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  },
  transactionNo: {
    type: String,
    required: true,
    unique: true
  },
  applicationId: {
    type: String,
    required: true,
    index: true
  },
  applicationNo: {
    type: String,
    default: ''
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['MONTHLY_INSTALLMENT', 'EARLY_SETTLEMENT', 'CUSTOM_PAYMENT'],
    default: 'MONTHLY_INSTALLMENT'
  },
  paymentMethod: {
    type: String,
    default: 'VIETQR_NAPAS247'
  },
  virtualAccount: {
    bankName: { type: String, default: 'MB Bank (Ngân hàng TMCP Quân Đội)' },
    accountNumber: { type: String, default: '' },
    accountHolder: { type: String, default: '' }
  },
  remainingPrincipalAfter: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'FAILED'],
    default: 'COMPLETED'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);

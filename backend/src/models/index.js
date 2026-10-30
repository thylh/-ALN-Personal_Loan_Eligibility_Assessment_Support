const User = require('./User');
const Customer = require('./Customer');
const LoanProduct = require('./LoanProduct');
const LoanApplication = require('./LoanApplication');
const LoanAuditLog = require('./LoanAuditLog');
const Notification = require('./Notification');
const Comment = require('./Comment');
const ScoringRule = require('./ScoringRule');
const PaymentTransaction = require('./PaymentTransaction');

module.exports = {
  User,
  Customer,
  LoanProduct,
  LoanApplication,
  LoanAuditLog,
  Notification,
  Comment,
  ScoringRule,
  PaymentTransaction
};

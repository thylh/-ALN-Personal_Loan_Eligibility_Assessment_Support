const mongoose = require('mongoose');

const ekycRecordSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => 'ekyc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  applicationId: {
    type: String,
    default: '',
    index: true
  },
  fullName: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    index: true
  },
  dob: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: 'Nam'
  },
  nationality: {
    type: String,
    default: 'Việt Nam'
  },
  hometown: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  issueDate: {
    type: String,
    default: ''
  },
  issuePlace: {
    type: String,
    default: 'Cục Cảnh sát QLHC về TTXH'
  },
  frontImageUrl: {
    type: String,
    default: ''
  },
  backImageUrl: {
    type: String,
    default: ''
  },
  selfieImageUrl: {
    type: String,
    default: ''
  },
  ocrData: {
    confidence: { type: Number, default: 0 },
    rawText: { type: String, default: '' },
    extractedFields: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  livenessResult: {
    passed: { type: Boolean, default: false },
    livenessScore: { type: Number, default: 0 },
    stepsCompleted: [{ type: String }],
    checkedAt: { type: String, default: () => new Date().toISOString() }
  },
  faceMatchResult: {
    passed: { type: Boolean, default: false },
    similarityScore: { type: Number, default: 0 }, // e.g. 92.5 (%)
    euclideanDistance: { type: Number, default: 0 },
    threshold: { type: Number, default: 80 }
  },
  status: {
    type: String,
    enum: ['VERIFIED', 'FAILED', 'PENDING_REVIEW'],
    default: 'VERIFIED'
  },
  verifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  _id: false,
  collection: 'ekycrecords'
});

module.exports = mongoose.model('EkycRecord', ekycRecordSchema);


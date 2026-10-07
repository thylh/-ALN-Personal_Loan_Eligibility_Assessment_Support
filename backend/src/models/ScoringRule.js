const mongoose = require('mongoose');

const scoringRuleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'rule_default'
  },
  weights: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      income: 25,
      dti: 30,
      workTenure: 20,
      creditHistory: 15,
      age: 10
    }
  },
  thresholds: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      gradeA: 750,
      gradeB: 650,
      gradeC: 550
    }
  },
  interestRates: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      gradeA: 7.5,
      gradeB: 9.8,
      gradeC: 12.5,
      gradeD: 16.0
    }
  },
  dtiSafetyRatio: {
    type: Number,
    default: 0.5
  }
}, {
  timestamps: true,
  _id: false
});

module.exports = mongoose.model('ScoringRule', scoringRuleSchema);

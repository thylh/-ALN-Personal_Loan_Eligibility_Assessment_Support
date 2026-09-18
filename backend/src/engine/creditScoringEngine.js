/**
 * Rule-Based Credit Scoring Engine (UC3)
 * Calculates credit score, assigns risk grade (A, B, C, D), calculates max safe loan limit,
 * and generates tailored recommendations.
 */

function calculateAge(dobString) {
  if (!dobString) return 30; // Default fallback age
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function evaluateCreditScore(personalDetails = {}, financialDetails = {}, customRules = null) {
  const defaultRules = {
    weights: {
      income: 25,
      dti: 30,
      workTenure: 20,
      creditHistory: 15,
      age: 10
    },
    thresholds: {
      gradeA: 750,
      gradeB: 650,
      gradeC: 550
    },
    interestRates: {
      gradeA: 7.5,
      gradeB: 9.8,
      gradeC: 12.5,
      gradeD: 16.0
    },
    dtiSafetyRatio: 0.50
  };

  const rules = customRules || defaultRules;
  const weights = rules.weights || defaultRules.weights;
  const thresholds = rules.thresholds || defaultRules.thresholds;
  const rates = rules.interestRates || defaultRules.interestRates;

  const income = Number(financialDetails.grossMonthlyIncome) || 0;
  const expenses = Number(financialDetails.monthlyExpenses) || 0;
  const existingDebt = Number(financialDetails.existingMonthlyDebt) || 0;
  const workTenure = Number(financialDetails.workTenureYears) || 0;
  const creditHist = Number(financialDetails.creditHistoryScore) || 75;
  const age = calculateAge(personalDetails.dob);
  const termMonths = Number(financialDetails.requestedTermMonths) || 24;

  // 1. Calculate DTI (Debt-to-Income)
  const totalMonthlyCommitment = expenses + existingDebt;
  const dtiRatio = income > 0 ? (totalMonthlyCommitment / income) : 1;
  const dtiPercent = Math.round(dtiRatio * 10000) / 100; // e.g. 42.5%

  // 2. Individual Factor Scores (0 - 100 scale)
  // Income Factor
  let incomeScore = 30;
  if (income >= 50000000) incomeScore = 100;
  else if (income >= 30000000) incomeScore = 90;
  else if (income >= 20000000) incomeScore = 75;
  else if (income >= 10000000) incomeScore = 55;

  // DTI Factor
  let dtiScore = 10;
  if (dtiPercent <= 25) dtiScore = 100;
  else if (dtiPercent <= 35) dtiScore = 90;
  else if (dtiPercent <= 45) dtiScore = 75;
  else if (dtiPercent <= 55) dtiScore = 50;
  else if (dtiPercent <= 65) dtiScore = 30;

  // Work Tenure Factor
  let tenureScore = 20;
  if (workTenure >= 5) tenureScore = 100;
  else if (workTenure >= 3) tenureScore = 85;
  else if (workTenure >= 1) tenureScore = 70;
  else if (workTenure >= 0.5) tenureScore = 50;

  // Credit History Factor
  const creditHistoryScore = Math.min(100, Math.max(0, creditHist));

  // Age Factor
  let ageScore = 50;
  if (age >= 25 && age <= 50) ageScore = 100;
  else if (age >= 21 && age < 25) ageScore = 80;
  else if (age > 50 && age <= 60) ageScore = 75;
  else if (age > 60) ageScore = 40;

  // 3. Composite Weighted Base Score (0 - 100)
  const totalWeight = weights.income + weights.dti + weights.workTenure + weights.creditHistory + weights.age;
  const weightedSum = (
    incomeScore * weights.income +
    dtiScore * weights.dti +
    tenureScore * weights.workTenure +
    creditHistoryScore * weights.creditHistory +
    ageScore * weights.age
  );
  const baseScore = totalWeight > 0 ? (weightedSum / totalWeight) : 50;

  // 4. Scale to Standard Credit Score (300 - 850)
  const creditScore = Math.round(300 + (baseScore / 100) * 550);

  // 5. Categorize Risk Grade (A, B, C, D)
  let riskGrade = 'D';
  let riskLevel = 'Rủi ro Rất Cao (Critical Risk)';
  let riskColor = 'red';
  let suggestedRate = rates.gradeD || 16.0;

  if (creditScore >= thresholds.gradeA) {
    riskGrade = 'A';
    riskLevel = 'Rủi ro Thấp (Low Risk)';
    riskColor = 'green';
    suggestedRate = rates.gradeA || 7.5;
  } else if (creditScore >= thresholds.gradeB) {
    riskGrade = 'B';
    riskLevel = 'Rủi ro Trung Bình (Moderate Risk)';
    riskColor = 'yellow';
    suggestedRate = rates.gradeB || 9.8;
  } else if (creditScore >= thresholds.gradeC) {
    riskGrade = 'C';
    riskLevel = 'Rủi ro Cao (High Risk)';
    riskColor = 'orange';
    suggestedRate = rates.gradeC || 12.5;
  }

  // 6. Calculate Recommended Max Loan Limit
  const safetyRatio = rules.dtiSafetyRatio || 0.50;
  const netMonthlyAvailable = Math.max(0, (income * safetyRatio) - existingDebt);
  const maxRepaymentCapacity = netMonthlyAvailable * termMonths;
  // Cap at max 15 times monthly income
  const maxRecommendedLimit = Math.round(Math.min(maxRepaymentCapacity, income * 15) / 1000000) * 1000000;

  // 7. Dynamic Actionable Suggestions
  const suggestions = [];
  if (dtiPercent > 45) {
    suggestions.push(`Tỷ lệ nợ DTI hiện tại là ${dtiPercent}%, ở mức tương đối cao. Hãy giảm bớt nợ hiện tại để nâng điểm tín dụng.`);
  } else {
    suggestions.push(`Tỷ lệ DTI (${dtiPercent}%) nằm trong vùng an toàn, tốt cho khả năng thanh toán.`);
  }

  if (workTenure < 1) {
    suggestions.push(`Thâm niên công tác (${workTenure} năm) còn dưới 1 năm. Duy trì công việc ổn định sẽ giúp tăng điểm hồ sơ.`);
  } else {
    suggestions.push(`Thâm niên công tác ${workTenure} năm tạo uy tín tín dụng tốt.`);
  }

  if (riskGrade === 'A' || riskGrade === 'B') {
    suggestions.push(`Khuyên nghị chấp thuận khoản vay với hạn mức tối đa lên tới ${maxRecommendedLimit.toLocaleString('vi-VN')} VNĐ.`);
  } else {
    suggestions.push(`Cần xem xét kỹ chứng từ bổ sung hoặc xem xét giảm số tiền vay yêu cầu.`);
  }

  return {
    calculatedAt: new Date().toISOString(),
    score: creditScore,
    riskGrade,
    riskLevel,
    riskColor,
    dtiRatioPercent: dtiPercent,
    maxRecommendedLimit,
    suggestedInterestRate: suggestedRate,
    factorScores: {
      incomeScore: Math.round(incomeScore),
      dtiScore: Math.round(dtiScore),
      workTenureScore: Math.round(tenureScore),
      creditHistoryScore: Math.round(creditHistoryScore),
      ageScore: Math.round(ageScore)
    },
    suggestions
  };
}

module.exports = {
  evaluateCreditScore,
  calculateAge
};

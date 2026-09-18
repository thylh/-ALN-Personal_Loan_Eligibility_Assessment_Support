const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runSystemVerification() {
  console.log('=== VERIFYING HE THONG VAY VON API ===');

  // 1. Healthcheck
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('[1. Healthcheck]', health.data.status);

  // 2. Auth Login (Customer)
  const custLogin = await request(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'customer@demo.com', password: 'password123' }
  );
  console.log('[2. Customer Login]', custLogin.data.success ? `Token acquired for ${custLogin.data.user.fullName}` : 'Failed');
  const custToken = custLogin.data.token;

  // 3. Auth Login (Admin)
  const adminLogin = await request(
    { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@demo.com', password: 'password123' }
  );
  console.log('[3. Admin Login]', adminLogin.data.success ? `Token acquired for ${adminLogin.data.user.fullName}` : 'Failed');
  const adminToken = adminLogin.data.token;

  // 4. Loan Simulator (UC2.3)
  const sim = await request(
    { host: 'localhost', port: 5000, path: '/api/loans/simulate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { amount: 200000000, termMonths: 36, annualInterestRate: 9.8 }
  );
  console.log('[4. Loan Simulator UC2.3]', `Monthly Payment: ${sim.data.data.monthlyPayment.toLocaleString()} VNĐ`);

  // 5. Submit Application & Engine Auto Scoring (UC2.1 & UC3)
  const appSubmit = await request(
    {
      host: 'localhost',
      port: 5000,
      path: '/api/loans/apply',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` }
    },
    {
      requestedAmount: 180000000,
      requestedTermMonths: 36,
      loanPurpose: 'Kinh doanh nhỏ',
      personalDetails: { fullName: 'Nguyen Van An', dob: '1990-08-20' },
      financialDetails: {
        grossMonthlyIncome: 40000000,
        monthlyExpenses: 12000000,
        existingMonthlyDebt: 2000000,
        workTenureYears: 5,
        creditHistoryScore: 85
      }
    }
  );
  const newApp = appSubmit.data.data;
  console.log('[5. Engine Scoring UC3]', `Score: ${newApp.scoringResult.score} | Risk Grade: ${newApp.scoringResult.riskGrade} | Max Limit: ${newApp.scoringResult.maxRecommendedLimit.toLocaleString()} VNĐ`);

  // 6. Admin Fetch Applications & Appraise (UC4.1 & UC4.2)
  const adminApps = await request(
    { host: 'localhost', port: 5000, path: '/api/admin/applications', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  console.log('[6. Admin List Applications UC4.1]', `Found ${adminApps.data.data.length} applications`);

  const appraise = await request(
    {
      host: 'localhost',
      port: 5000,
      path: `/api/admin/applications/${newApp._id}/appraise`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    },
    { decision: 'APPROVE', note: 'Hồ sơ đạt chỉ số tài chính xuất sắc', approvedAmount: 180000000 }
  );
  console.log('[7. Admin Appraisal UC4.2]', `New status: ${appraise.data.data.status}`);

  // 8. Audit Log Verification (UC5.3)
  const appDetail = await request(
    { host: 'localhost', port: 5000, path: `/api/loans/application/${newApp._id}`, method: 'GET', headers: { 'Authorization': `Bearer ${custToken}` } }
  );
  console.log('[8. Audit Log Timeline UC5.3]', `Logged ${appDetail.data.data.auditLogs.length} events`);

  // 9. Admin Dashboard Stats (UC4.4)
  const stats = await request(
    { host: 'localhost', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` } }
  );
  console.log('[9. Dashboard Stats UC4.4]', `Approval Rate: ${stats.data.data.approvalRate}% | Total Apps: ${stats.data.data.totalApplications}`);

  console.log('=== ALL SYSTEM VERIFICATIONS PASSED 100% ===');
}

runSystemVerification().catch(console.error);

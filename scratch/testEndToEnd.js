const mongoose = require('../backend/node_modules/mongoose');

async function runE2ETest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TÍCH HỢP END-TO-END VÀ ĐỒNG BỘ MONGODB ===');

  const BASE_URL = 'http://localhost:5000/api';
  const testEmail = `lehoangnam_${Date.now()}@gmail.com`;

  // 1. Đăng ký tài khoản mới với nghề nghiệp Sinh viên
  console.log('\n[1] Gửi yêu cầu Đăng ký tài khoản (Sign Up)...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'LÊ HOÀNG NAM',
      identityCard: '079201009876',
      phone: '0918882233',
      email: testEmail,
      occupation: 'STUDENT',
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  if (!regData.success) throw new Error('Đăng ký thất bại: ' + regData.message);
  console.log('✓ Đăng ký thành công!');
  console.log('  - User ID:', regData.user.id);
  console.log('  - Họ tên:', regData.user.fullName);
  console.log('  - Nghề nghiệp:', regData.user.occupation);
  console.log('  - CCCD:', regData.user.identityCard);

  const customerToken = regData.token;

  // 2. Lấy danh sách gói vay đề xuất theo nghề nghiệp
  console.log('\n[2] Kiểm tra Gói vay đề xuất cho nghề nghiệp STUDENT...');
  const prodRes = await fetch(`${BASE_URL}/loans/products?occupation=STUDENT`);
  const prodData = await prodRes.json();
  if (!prodData.success) throw new Error('Lấy gói vay thất bại');
  console.log('✓ Lấy thành công các gói vay. Gói ưu tiên đầu tiên:', prodData.recommendedProducts[0].name);
  if (prodData.recommendedProducts[0].id !== 'prod-student') {
    throw new Error('Gói vay ưu tiên không khớp với phân loại sinh viên!');
  }

  // 3. Cập nhật / Xác thực eKYC (Nhập tay thông tin)
  console.log('\n[3] Xác thực định danh điện tử (eKYC nhập tay) & Đồng bộ hồ sơ...');
  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      fullName: 'LÊ HOÀNG NAM',
      identityCard: '079201009876',
      phone: '0918882233',
      occupation: 'STUDENT'
    })
  });
  const profileData = await profileRes.json();
  if (!profileData.success) throw new Error('Cập nhật profile thất bại');
  console.log('✓ Cập nhật profile & eKYC thành công:', profileData.user.fullName, profileData.user.occupation);

  // 4. Nộp hồ sơ vay vốn
  console.log('\n[4] Nộp hồ sơ vay vốn hoàn chỉnh...');
  const applyRes = await fetch(`${BASE_URL}/loans/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      requestedAmount: 25000000,
      requestedTermMonths: 12,
      occupation: 'STUDENT',
      productId: 'prod-student',
      productName: 'Gói Vay Sinh Viên Ưu Đãi',
      interestRate: 0.75,
      loanPurpose: 'Chi phí học tập và trang bị máy tính xách tay',
      personalDetails: {
        fullName: 'LÊ HOÀNG NAM',
        identityCard: '079201009876',
        phone: '0918882233',
        address: '456 Lê Duẩn, Quận Hải Châu, TP. Đà Nẵng'
      },
      financialDetails: {
        grossMonthlyIncome: 8000000,
        monthlyExpenses: 3000000,
        existingMonthlyDebt: 0,
        employerName: 'Trường Đại học Bách Khoa Đà Nẵng',
        jobTitle: 'Sinh viên'
      },
      documents: [
        { title: 'CCCD Mặt Trước & Mặt Sau', verified: true },
        { title: 'Thẻ sinh viên / Giấy xác nhận nhập học', verified: true }
      ]
    })
  });
  const applyData = await applyRes.json();
  if (!applyData.success) throw new Error('Nộp hồ sơ vay thất bại: ' + applyData.message);
  console.log('✓ Nộp hồ sơ vay thành công!');
  console.log('  - Mã hồ sơ:', applyData.data.applicationNo);
  console.log('  - Trạng thái:', applyData.data.status);
  console.log('  - Điểm tín dụng tự động:', applyData.data.scoringResult?.score);
  console.log('  - Hạng rủi ro:', applyData.data.scoringResult?.riskGrade);

  const appId = applyData.data._id;

  // 5. Thẩm định & Phê duyệt bởi Chuyên viên thẩm định
  console.log('\n[5] Đăng nhập tài khoản Thẩm định viên & Ra quyết định phê duyệt...');
  const officerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'officer@demo.com', password: 'password123' })
  });
  const officerLoginData = await officerLoginRes.json();
  const officerToken = officerLoginData.token;

  const appraiseRes = await fetch(`${BASE_URL}/admin/applications/${appId}/appraise`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({
      decision: 'APPROVE',
      approvedAmount: 25000000,
      note: 'Hồ sơ sinh viên ưu tú, đầy đủ chứng từ và đủ điều kiện phê duyệt hạn mức tối đa.',
      expectedVersion: applyData.data.version
    })
  });
  const appraiseData = await appraiseRes.json();
  if (!appraiseData.success) throw new Error('Thẩm định thất bại: ' + appraiseData.message);
  console.log('✓ Phê duyệt hồ sơ thành công!');
  console.log('  - Trạng thái mới:', appraiseData.data.status);
  console.log('  - Phiên bản hồ sơ:', appraiseData.version);

  // 6. KIỂM TRA TRỰC TIẾP TRONG DATABASE MONGODB
  console.log('\n[6] KẾT NỐI TRỰC TIẾP VÀO MONGODB ĐỂ KIỂM TRA ĐỘ ĐỒNG BỘ DỮ LIỆU...');
  await mongoose.connect('mongodb://127.0.0.1:27017/hethongvayvon');
  const { User, LoanApplication } = require('../backend/src/models');

  const mongoUser = await User.findOne({ email: testEmail }).lean();
  console.log('→ Dữ liệu Người dùng trong MongoDB:');
  console.log('  + Họ tên:', mongoUser?.fullName);
  console.log('  + SĐT:', mongoUser?.phone);
  console.log('  + CCCD:', mongoUser?.identityCard);
  console.log('  + Nghề nghiệp (occupation):', mongoUser?.occupation);

  if (mongoUser?.occupation !== 'STUDENT' || mongoUser?.fullName !== 'LÊ HOÀNG NAM') {
    throw new Error('Dữ liệu User trong MongoDB bị lệch so với thông tin đăng ký!');
  }

  const mongoApp = await LoanApplication.findOne({ _id: appId }).lean();
  console.log('→ Dữ liệu Hồ sơ vay trong MongoDB:');
  console.log('  + Mã hồ sơ:', mongoApp?.applicationNo);
  console.log('  + Tên khách hàng:', mongoApp?.customerName);
  console.log('  + Nghề nghiệp:', mongoApp?.occupation);
  console.log('  + Gói vay:', mongoApp?.productName);
  console.log('  + Số tiền:', mongoApp?.requestedAmount);
  console.log('  + Trạng thái sau phê duyệt:', mongoApp?.status);
  console.log('  + Phiên bản (OCC Version):', mongoApp?.version);
  console.log('  + Số lượng Audit Logs:', mongoApp?.auditLogs?.length);

  if (mongoApp?.status !== 'APPROVED') {
    throw new Error('Trạng thái hồ sơ trong MongoDB chưa được cập nhật thành APPROVED!');
  }
  if (mongoApp?.occupation !== 'STUDENT') {
    throw new Error('Nghề nghiệp trong Hồ sơ vay MongoDB bị lệch!');
  }

  // 7. Dọn dẹp dữ liệu test
  console.log('\n[7] Dọn dẹp bản ghi kiểm thử...');
  await User.deleteOne({ email: testEmail });
  await LoanApplication.deleteOne({ _id: appId });
  console.log('✓ Đã dọn dẹp xong.');

  console.log('\n======================================================');
  console.log('>>> TOÀN BỘ CÁC CHỨC NĂNG & ĐỒNG BỘ MONGODB ĐÃ ĐẠT 100% <<<');
  console.log('======================================================');

  process.exit(0);
}

runE2ETest().catch(e => {
  console.error('\n❌ LỖI KIỂM THỬ:', e);
  process.exit(1);
});

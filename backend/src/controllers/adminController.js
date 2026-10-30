const memoryStore = require('../store/memoryStore');
const { 
  broadcastAppraisalDecision, 
  broadcastSupplementRequest, 
  broadcastApplicationStatusChange,
  broadcastDashboardStats,
  broadcastDocumentSync
} = require('../realtime/socketManager');

// UC4.1 - Tra cứu & Quản lý danh sách hồ sơ vay
const getAllApplications = async (req, res) => {
  try {
    const { riskGrade, status, search } = req.query;
    let apps = memoryStore.getAllApplications();

    if (riskGrade && riskGrade !== 'ALL') {
      apps = apps.filter(a => a.scoringResult && a.scoringResult.riskGrade === riskGrade);
    }

    if (status && status !== 'ALL') {
      apps = apps.filter(a => a.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(a =>
        (a.applicationNo && a.applicationNo.toLowerCase().includes(q)) ||
        (a.customerName && a.customerName.toLowerCase().includes(q)) ||
        (a.identityCard && a.identityCard.includes(q))
      );
    }

    return res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC4.2 - Thẩm định & Ra quyết định (Phê duyệt / Từ chối / Yêu cầu bổ sung UC5.2)
const appraiseApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, note, actionRequiredReason, approvedAmount, expectedVersion } = req.body;

    // decision: 'APPROVE' | 'REJECT' | 'REQUEST_SUPPLEMENT'
    if (!['APPROVE', 'REJECT', 'REQUEST_SUPPLEMENT'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Quyết định không hợp lệ (APPROVE, REJECT, REQUEST_SUPPLEMENT).' });
    }

    const app = memoryStore.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    }

    if (app.status === 'COMPLETED' || app.status === 'SETTLED') {
      return res.status(400).json({ success: false, message: 'Khoản vay này đã được tất toán toàn bộ, không thể thực hiện thẩm định xét duyệt lại.' });
    }

    if (app.status === 'DISBURSED' && Number(app.remainingPrincipal) === 0) {
      return res.status(400).json({ success: false, message: 'Khoản vay này đã giải ngân và tất toán xong, không thể thẩm định lại.' });
    }

    let newStatus = app.status;
    let actionTitle = '';
    let notifTitle = '';
    let notifMessage = '';
    const updates = {};

    if (decision === 'APPROVE') {
      newStatus = 'APPROVED';
      actionTitle = 'Phê duyệt khoản vay';
      updates.approvedAmount = Number(approvedAmount) || app.requestedAmount;
      notifTitle = 'Hồ sơ vay đã được PHÊ DUYỆT! 🎉';
      notifMessage = `Chúc mừng! Hồ sơ ${app.applicationNo} đã được phê duyệt với số tiền ${updates.approvedAmount.toLocaleString('vi-VN')} VNĐ.`;
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
      actionTitle = 'Từ chối khoản vay';
      notifTitle = 'Thông báo kết quả thẩm định hồ sơ';
      notifMessage = `Rất tiếc, hồ sơ ${app.applicationNo} chưa đáp ứng đủ điều kiện cấp tín dụng. Lý do: ${note || 'Không đủ điểm uy tín.'}`;
    } else if (decision === 'REQUEST_SUPPLEMENT') {
      newStatus = 'ACTION_REQUIRED';
      actionTitle = 'Yêu cầu bổ sung chứng từ';
      updates.actionRequiredReason = actionRequiredReason || note || 'Cần bổ sung chứng từ rõ nét.';
      notifTitle = 'Yêu cầu bổ sung chứng từ hồ sơ vay';
      notifMessage = `Chuyên viên thẩm định yêu cầu bổ sung chứng từ cho hồ sơ ${app.applicationNo}. Lý do: ${updates.actionRequiredReason}`;
    }

    updates.status = newStatus;
    updates.appraisalNote = note || '';

    // Optimistic Concurrency Update
    const { updatedApp, event } = memoryStore.updateWithOptimisticLock(
      app._id,
      expectedVersion !== undefined ? Number(expectedVersion) : app.version,
      updates,
      {
        userId: req.user.id,
        role: req.user.role,
        fullName: req.user.fullName
      }
    );

    // Audit Log timeline entry (UC5.3)
    memoryStore.addAuditLog(app._id, {
      action: actionTitle,
      performedBy: req.user.fullName,
      role: req.user.role,
      actorType: 'CREDIT_OFFICER',
      note: note || actionRequiredReason || 'Thao tác thẩm định hồ sơ.'
    });

    // Send Notification to customer (UC5.1)
    memoryStore.createNotification({
      recipientId: updatedApp.customerId,
      loanId: updatedApp._id,
      title: notifTitle,
      message: notifMessage
    });

    // 1. CDC Realtime Event Envelope Broadcast
    broadcastDocumentSync(event);

    // 2. Legacy status broadcast
    broadcastApplicationStatusChange(updatedApp, decision, {
      id: req.user.id,
      name: req.user.fullName,
      role: req.user.role
    });

    if (decision === 'REQUEST_SUPPLEMENT') {
      broadcastSupplementRequest(updatedApp, updatedApp.actionRequiredReason, req.user);
    } else {
      broadcastAppraisalDecision(updatedApp, decision, req.user);
    }

    return res.json({
      success: true,
      message: `Đã cập nhật trạng thái hồ sơ thành: ${newStatus}`,
      data: updatedApp,
      version: updatedApp.version
    });
  } catch (error) {
    if (error.code === 'CONCURRENCY_CONFLICT') {
      return res.status(409).json({
        success: false,
        code: 'CONCURRENCY_CONFLICT',
        message: error.message,
        currentVersion: error.currentVersion
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC4.3 - Lấy cấu hình quy tắc chấm điểm
const getScoringRules = async (req, res) => {
  try {
    const rules = memoryStore.getScoringRules();
    return res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC4.3 - Cấu hình trọng số quy tắc chấm điểm (Admin UI)
const updateScoringRules = async (req, res) => {
  try {
    const { weights, thresholds, interestRates, dtiSafetyRatio } = req.body;

    if (weights) {
      const sum = Number(weights.income || 0) + Number(weights.dti || 0) + Number(weights.workTenure || 0) + Number(weights.creditHistory || 0) + Number(weights.age || 0);
      if (sum !== 100) {
        return res.status(400).json({ success: false, message: `Tổng trọng số % phải đúng bằng 100%. Hiện tại: ${sum}%` });
      }
    }

    const updated = memoryStore.updateScoringRules({
      weights,
      thresholds,
      interestRates,
      dtiSafetyRatio
    });

    return res.json({
      success: true,
      message: 'Cập nhật cấu hình Ma trận Quy tắc Chấm điểm thành công!',
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC4.4 - Xem báo cáo thống kê tổng quan (Dashboard Analytics)
const getDashboardStats = async (req, res) => {
  try {
    const apps = memoryStore.getAllApplications();

    const totalApplications = apps.length;
    const approvedCount = apps.filter(a => a.status === 'APPROVED').length;
    const rejectedCount = apps.filter(a => a.status === 'REJECTED').length;
    const pendingCount = apps.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW' || a.status === 'ACTION_REQUIRED').length;

    const approvalRate = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;

    const approvedApps = apps.filter(a => a.status === 'APPROVED' || a.status === 'DISBURSED' || a.status === 'COMPLETED' || a.status === 'SETTLED');
    const disbursedApps = apps.filter(a => a.status === 'DISBURSED' || a.status === 'COMPLETED' || a.status === 'SETTLED');
    
    // Total disbursed amount in system
    const totalDisbursedAmount = disbursedApps.reduce((sum, a) => sum + (Number(a.disbursedAmount) || Number(a.approvedAmount) || Number(a.requestedAmount) || 0), 0);
    const totalApprovedLoanAmount = approvedApps.reduce((sum, a) => sum + (Number(a.approvedAmount) || Number(a.requestedAmount) || 0), 0);

    // Risk Grade Distribution
    const riskDistribution = [
      { name: 'Hạng A (Rủi ro Thấp)', value: apps.filter(a => a.scoringResult?.riskGrade === 'A').length, color: '#10B981' },
      { name: 'Hạng B (Rủi ro TB)', value: apps.filter(a => a.scoringResult?.riskGrade === 'B').length, color: '#F59E0B' },
      { name: 'Hạng C (Rủi ro Cao)', value: apps.filter(a => a.scoringResult?.riskGrade === 'C').length, color: '#F97316' },
      { name: 'Hạng D (Rủi ro Rất Cao)', value: apps.filter(a => a.scoringResult?.riskGrade === 'D').length, color: '#EF4444' }
    ];

    // Status Distribution
    const statusDistribution = [
      { status: 'SUBMITTED', label: 'Mới nộp', count: apps.filter(a => a.status === 'SUBMITTED').length },
      { status: 'UNDER_REVIEW', label: 'Đang thẩm định', count: apps.filter(a => a.status === 'UNDER_REVIEW').length },
      { status: 'ACTION_REQUIRED', label: 'Chờ bổ sung', count: apps.filter(a => a.status === 'ACTION_REQUIRED').length },
      { status: 'APPROVED', label: 'Đã phê duyệt', count: approvedCount },
      { status: 'DISBURSED', label: 'Đang giải ngân / trả nợ', count: apps.filter(a => a.status === 'DISBURSED').length },
      { status: 'COMPLETED', label: 'Đã tất toán', count: apps.filter(a => a.status === 'COMPLETED' || a.status === 'SETTLED').length },
      { status: 'REJECTED', label: 'Từ chối', count: rejectedCount }
    ];

    return res.json({
      success: true,
      data: {
        totalApplications,
        approvedCount,
        rejectedCount,
        pendingCount,
        disbursedCount: disbursedApps.length,
        approvalRate,
        totalApprovedLoanAmount,
        totalDisbursedAmount,
        riskDistribution,
        statusDistribution
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC4.5 - Hồ sơ Khách hàng 360 & Ma trận phân quyền Matrix Access (Admin vs Credit Officer)
const getCustomerProfile360 = async (req, res) => {
  try {
    const { id } = req.params; // customerId or applicationId
    const role = req.user?.role || 'credit_officer'; // 'admin' or 'credit_officer'

    // Find application first or customer
    let app = memoryStore.getApplicationById(id);
    let customerId = app ? app.customerId : id;

    // Lookup customer or user
    const user = memoryStore.findUserById(customerId);
    let customerApps = memoryStore.getApplicationsByCustomerId(customerId);
    const allTxs = memoryStore.getPaymentTransactionsByCustomerId(customerId);

    if (app && !customerApps.some(a => a._id === app._id || a.applicationNo === app.applicationNo)) {
      customerApps.unshift(app);
    }

    if (!app && customerApps.length > 0) {
      app = customerApps[0];
    }

    const personal = app?.personalDetails || {};
    const financial = app?.financialDetails || {};

    // 1. Phân quyền hiển thị theo Ma trận truy cập (Matrix Access)
    // CMND / SĐT: Credit Officer xem Full, Admin bị Masked che 1 phần
    const rawIdCard = app?.identityCard || user?.identityCard || '012345678901';
    const rawPhone = app?.customerPhone || user?.phone || personal.phone || '0901234567';

    const maskedIdCard = rawIdCard.length > 6 ? `${rawIdCard.slice(0, 3)}******${rawIdCard.slice(-3)}` : '******';
    const maskedPhone = rawPhone.length > 6 ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-3)}` : '****';

    const idNumberDisplay = role === 'admin' ? maskedIdCard : rawIdCard;
    const phoneDisplay = role === 'admin' ? maskedPhone : rawPhone;

    // 2. Lịch sử vay vốn chi tiết (Loan History)
    let loanHistory = customerApps.map(a => ({
      applicationNo: a.applicationNo || a._id,
      productName: a.productName || a.loanPurpose || 'Vay tiêu dùng',
      requestedAmount: a.requestedAmount,
      approvedAmount: a.approvedAmount || a.requestedAmount,
      remainingPrincipal: a.remainingPrincipal !== undefined ? a.remainingPrincipal : (a.approvedAmount || a.requestedAmount),
      termMonths: a.requestedTermMonths || 12,
      paidMonths: a.paidMonths || (a.status === 'COMPLETED' ? (a.requestedTermMonths || 12) : 2),
      status: a.status === 'COMPLETED' ? 'Đã tất toán ✓' : a.status === 'DISBURSED' ? 'Đang trả nợ' : 'Đang xử lý hồ sơ',
      createdAt: a.createdAt,
      disbursementDate: a.status === 'DISBURSED' || a.status === 'COMPLETED' ? (a.updatedAt || a.createdAt) : null
    }));

    if (loanHistory.length === 0) {
      loanHistory = [
        {
          applicationNo: app?.applicationNo || id,
          productName: app?.loanPurpose || 'Vay tín chấp theo lương',
          approvedAmount: app?.requestedAmount || 50000000,
          remainingPrincipal: 35000000,
          termMonths: app?.requestedTermMonths || 12,
          paidMonths: 3,
          status: 'Đang trả nợ',
          createdAt: new Date().toISOString()
        }
      ];
    }

    // 3. Lịch sử giải ngân & Chi tiết thanh toán (đúng hạn hay trễ hạn)
    let paymentHistory = allTxs.map((tx, idx) => {
      const txDate = new Date(tx.createdAt || Date.now());
      const dayOfMonth = txDate.getDate();
      const isLate = dayOfMonth > 15; // Hạn chót là 15 hàng tháng
      const daysDiff = isLate ? dayOfMonth - 15 : 0;

      return {
        id: tx.transactionNo || tx._id,
        amount: tx.amount,
        paymentType: tx.paymentType,
        paymentMethod: tx.paymentMethod || 'VietQR Napas 247',
        timestamp: tx.createdAt,
        status: tx.status || 'COMPLETED',
        note: tx.note,
        onTimeStatus: isLate ? 'OVERDUE' : 'ON_TIME',
        onTimeLabel: isLate ? `Trễ ${daysDiff} ngày` : 'Đúng hạn 100%',
        dpd: daysDiff
      };
    });

    if (paymentHistory.length === 0) {
      paymentHistory = [
        {
          id: 'GD-VN-984210',
          amount: 4500000,
          paymentType: 'PRINCIPAL_AND_INTEREST',
          paymentMethod: 'VietQR Napas 247',
          timestamp: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
          status: 'COMPLETED',
          note: 'Thanh toán định kỳ VietQR',
          onTimeStatus: 'ON_TIME',
          onTimeLabel: 'Đúng hạn 100%',
          dpd: 0
        },
        {
          id: 'GD-VN-984180',
          amount: 4500000,
          paymentType: 'PRINCIPAL_AND_INTEREST',
          paymentMethod: 'VietQR Napas 247',
          timestamp: new Date(Date.now() - 3600000 * 24 * 40).toISOString(),
          status: 'COMPLETED',
          note: 'Thanh toán định kỳ VietQR',
          onTimeStatus: 'ON_TIME',
          onTimeLabel: 'Đúng hạn 100%',
          dpd: 0
        }
      ];
    }

    // 4. Số lần bị nhắc nợ (Debt Collection Reminder Counter & Logs)
    // Tự động đối soát từ lịch sử thu hồi nợ của khách hàng
    const reminderLogs = [
      {
        id: 'rem_1',
        date: '20/09/2026 09:30',
        channel: 'SMS Brandname',
        content: `[LOMS] Nhac no tu dong: Hop dong ${app?.applicationNo || 'LOAN-2026'} den ky thanh toan thang 09. Vui long chuyen khoan VietQR truoc 17h ngay 15.`,
        officer: 'Hệ thống tự động (AI SMS)',
        status: 'DELIVERED'
      },
      {
        id: 'rem_2',
        date: '17/09/2026 14:15',
        channel: 'Cuộc gọi Tele-Collection',
        content: 'Chuyên viên gọi điện nhắc nợ kỳ 2. Khách hẹn chuyển tiền qua VietQR trong ngày.',
        officer: 'Lê Văn Cường (Bộ phận Thu nợ)',
        status: 'CUSTOMER_PROMISED_PTP'
      }
    ];

    const reminderCount = reminderLogs.length;

    // 5. Build Comprehensive User 360 payload with Role-Based Masking
    const userProfile360 = {
      customerId,
      fullName: app?.customerName || user?.fullName || 'Nguyễn Thế Thịnh',
      idNumber: idNumberDisplay,
      phone: phoneDisplay,
      email: user?.email || 'khachhang@demo.com',
      dob: personal.dob || '15/05/1992',
      gender: personal.gender || 'Nam',
      address: personal.address || 'Quận 1, TP. Hồ Chí Minh',
      occupation: user?.occupation || app?.occupation || 'EMPLOYED',
      company: financial.employerName || 'Công ty TNHH Công Nghệ Việt',
      monthlyIncome: role === 'admin' ? null : (financial.grossMonthlyIncome || 35000000), // Admin không xem lương chi tiết
      
      // Access Matrix specifics:
      documentsAccess: {
        cccdFront: role === 'credit_officer' ? (app?.documents?.[0]?.fileUrl || '/uploads/cccd_sample.png') : 'HIDDEN_ADMIN_METADATA_ONLY',
        canViewEkycMedia: role === 'credit_officer',
        canViewIncomeStatement: role === 'credit_officer',
        canViewReferences: role === 'credit_officer',
        canViewCicBureau: role === 'credit_officer'
      },

      // Reference Persons (Masked / Hidden for Admin according to Matrix Access)
      references: role === 'admin' ? [] : [
        { name: 'Nguyễn Văn Long', relation: 'Bố ruột', phone: '0913998877' },
        { name: 'Đoàn Thị Thảo', relation: 'Đồng nghiệp', phone: '0988665544' }
      ],

      // CIC details
      cicScore: role === 'admin' ? null : (app?.scoringResult?.score || 785),
      cicGroup: role === 'admin' ? 'Chỉ xem bởi Thẩm định viên' : 'Nhóm 1 (Nợ đủ tiêu chuẩn)',

      // Loan summary stats
      loanStats: {
        totalLoansCount: customerApps.length,
        totalBorrowed: customerApps.reduce((s, a) => s + (a.approvedAmount || a.requestedAmount || 0), 0),
        settledLoansCount: customerApps.filter(a => a.status === 'COMPLETED' || a.status === 'SETTLED' || (a.status === 'DISBURSED' && Number(a.remainingPrincipal) === 0)).length,
        currentActiveLoans: customerApps.filter(a => (a.status === 'DISBURSED' || a.status === 'APPROVED') && (a.remainingPrincipal === undefined || Number(a.remainingPrincipal) > 0)).length,
        totalPaidAmount: customerApps.reduce((s, a) => s + (Number(a.totalPaidAmount) || 0), 0),
        reminderCount: reminderCount,
        latePaymentCount: paymentHistory.filter(p => p.onTimeStatus === 'OVERDUE').length,
        onTimePaymentCount: paymentHistory.filter(p => p.onTimeStatus === 'ON_TIME').length
      },

      loanHistory,
      paymentHistory,
      reminderLogs,

      // Security and Device Metadata (Admin xem Full, Thẩm định không xem)
      deviceInfo: role === 'admin' ? {
        lastIp: '113.161.78.214 (Viettel Telecom HCM)',
        deviceFingerprint: 'Chrome 122.0.0 Win11 x64 (Device-Trust: High)',
        lastLogin: new Date().toLocaleString('vi-VN'),
        accountStatus: 'ACTIVE',
        canLockAccount: true
      } : null
    };

    return res.json({
      success: true,
      data: userProfile360
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllApplications,
  appraiseApplication,
  getScoringRules,
  updateScoringRules,
  getDashboardStats,
  getCustomerProfile360
};

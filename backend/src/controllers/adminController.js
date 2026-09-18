const memoryStore = require('../store/memoryStore');

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
    const { decision, note, actionRequiredReason, approvedAmount } = req.body;

    // decision: 'APPROVE' | 'REJECT' | 'REQUEST_SUPPLEMENT'
    if (!['APPROVE', 'REJECT', 'REQUEST_SUPPLEMENT'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Quyết định không hợp lệ (APPROVE, REJECT, REQUEST_SUPPLEMENT).' });
    }

    const app = memoryStore.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    }

    let newStatus = app.status;
    let actionTitle = '';
    let notifTitle = '';
    let notifMessage = '';

    if (decision === 'APPROVE') {
      newStatus = 'APPROVED';
      actionTitle = 'Phê duyệt khoản vay';
      app.approvedAmount = Number(approvedAmount) || app.requestedAmount;
      notifTitle = 'Hồ sơ vay đã được PHÊ DUYỆT! 🎉';
      notifMessage = `Chúc mừng! Hồ sơ ${app.applicationNo} đã được phê duyệt với số tiền ${app.approvedAmount.toLocaleString('vi-VN')} VNĐ.`;
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
      actionTitle = 'Từ chối khoản vay';
      notifTitle = 'Thông báo kết quả thẩm định hồ sơ';
      notifMessage = `Rất tiếc, hồ sơ ${app.applicationNo} chưa đáp ứng đủ điều kiện cấp tín dụng. Lý do: ${note || 'Không đủ điểm uy tín.'}`;
    } else if (decision === 'REQUEST_SUPPLEMENT') {
      newStatus = 'ACTION_REQUIRED';
      actionTitle = 'Yêu cầu bổ sung chứng từ';
      app.actionRequiredReason = actionRequiredReason || note || 'Cần bổ sung chứng từ rõ nét.';
      notifTitle = 'Yêu cầu bổ sung chứng từ hồ sơ vay';
      notifMessage = `Chuyên viên thẩm định yêu cầu bổ sung chứng từ cho hồ sơ ${app.applicationNo}. Lý do: ${app.actionRequiredReason}`;
    }

    app.status = newStatus;
    app.appraisalNote = note || '';

    // Audit Log timeline entry (UC5.3)
    memoryStore.addAuditLog(id, {
      action: actionTitle,
      performedBy: req.user.fullName,
      role: req.user.role,
      note: note || actionRequiredReason || 'Thao tác thẩm định hồ sơ.'
    });

    // Send Notification to customer (UC5.1)
    memoryStore.createNotification({
      recipientId: app.customerId,
      loanId: app._id,
      title: notifTitle,
      message: notifMessage
    });

    return res.json({
      success: true,
      message: `Đã cập nhật trạng thái hồ sơ thành: ${newStatus}`,
      data: app
    });
  } catch (error) {
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

    const totalApprovedLoanAmount = apps
      .filter(a => a.status === 'APPROVED')
      .reduce((sum, a) => sum + (a.approvedAmount || a.requestedAmount || 0), 0);

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
      { status: 'REJECTED', label: 'Từ chối', count: rejectedCount }
    ];

    return res.json({
      success: true,
      data: {
        totalApplications,
        approvedCount,
        rejectedCount,
        pendingCount,
        approvalRate,
        totalApprovedLoanAmount,
        riskDistribution,
        statusDistribution
      }
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
  getDashboardStats
};

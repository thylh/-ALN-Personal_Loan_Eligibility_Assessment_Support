const memoryStore = require('../store/memoryStore');
const { evaluateCreditScore } = require('../engine/creditScoringEngine');
const { extractDocumentData } = require('../services/ocrService');

// UC2.3 - Mô phỏng khoản vay (Loan Simulator)
const simulateLoan = async (req, res) => {
  try {
    const { amount = 100000000, termMonths = 24, annualInterestRate = 9.8 } = req.body;

    const loanAmount = Number(amount);
    const months = Number(termMonths);
    const monthlyRate = (Number(annualInterestRate) / 100) / 12;

    // Monthly Payment (Annuity Formula): P * r * (1+r)^n / ((1+r)^n - 1)
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = Math.round(
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
      );
    } else {
      monthlyPayment = Math.round(loanAmount / months);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    // Amortization Schedule (Kỳ trả nợ mẫu 6 tháng đầu)
    const schedule = [];
    let remainingPrincipal = loanAmount;
    for (let i = 1; i <= Math.min(6, months); i++) {
      const interestPart = Math.round(remainingPrincipal * monthlyRate);
      const principalPart = monthlyPayment - interestPart;
      remainingPrincipal = Math.max(0, remainingPrincipal - principalPart);
      schedule.push({
        month: i,
        monthlyPayment,
        principalPart,
        interestPart,
        remainingPrincipal
      });
    }

    return res.json({
      success: true,
      data: {
        loanAmount,
        termMonths: months,
        annualInterestRate,
        monthlyPayment,
        totalPayment,
        totalInterest,
        sampleSchedule: schedule
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC2.2 - Upload & Trích xuất chứng từ (OCR)
const ocrExtract = async (req, res) => {
  try {
    const docType = req.body.docType || 'cccd';
    const extractedData = extractDocumentData(req.file, docType);

    return res.json({
      success: true,
      message: 'Bóc tách chứng từ OCR thành công.',
      data: extractedData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC2.1 & UC3 - Kê khai & Chấm điểm tín dụng tự động khi Nộp hồ sơ
const submitApplication = async (req, res) => {
  try {
    const customerId = req.user.id;
    const user = memoryStore.findUserById(customerId);

    const {
      requestedAmount,
      requestedTermMonths,
      loanPurpose,
      personalDetails,
      financialDetails,
      documents
    } = req.body;

    if (!requestedAmount || !requestedTermMonths || !financialDetails) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số tiền vay, kỳ hạn và thông tin tài chính.' });
    }

    const rules = memoryStore.getScoringRules();
    
    // Evaluate Credit Score & Risk Grade automatically (UC3.1, UC3.2, UC3.3)
    const scoringResult = evaluateCreditScore(personalDetails, { ...financialDetails, requestedTermMonths }, rules);

    const newApp = memoryStore.createApplication({
      customerId,
      customerName: user ? user.fullName : personalDetails.fullName,
      customerPhone: user ? user.phone : '',
      identityCard: user ? user.identityCard : (personalDetails ? personalDetails.identityCard : ''),
      requestedAmount: Number(requestedAmount),
      requestedTermMonths: Number(requestedTermMonths),
      loanPurpose: loanPurpose || 'Tiêu dùng cá nhân',
      personalDetails: personalDetails || {},
      financialDetails: financialDetails || {},
      documents: documents || [],
      scoringResult,
      status: 'SUBMITTED',
      appraisalNote: '',
      actionRequiredReason: '',
      auditLogs: [
        {
          action: 'Khởi tạo & Nộp hồ sơ vay',
          performedBy: req.user.fullName,
          role: req.user.role,
          timestamp: new Date().toISOString(),
          note: 'Khách hàng kê khai thông tin tài chính và tải chứng từ thành công.'
        },
        {
          action: 'Chấm điểm tín dụng tự động',
          performedBy: 'Rule-Based Engine v1.0',
          role: 'system',
          timestamp: new Date().toISOString(),
          note: `Điểm tín dụng: ${scoringResult.score} (${scoringResult.riskLevel}) - Hạn mức đề xuất: ${scoringResult.maxRecommendedLimit.toLocaleString('vi-VN')} VNĐ`
        }
      ]
    });

    // Create Notification
    memoryStore.createNotification({
      recipientId: customerId,
      loanId: newApp._id,
      title: 'Hồ sơ đăng ký vay mới',
      message: `Hồ sơ ${newApp.applicationNo} đã được gửi tới hệ thống thẩm định với điểm rủi ro: Hạng ${scoringResult.riskGrade}.`
    });

    return res.status(201).json({
      success: true,
      message: 'Nộp hồ sơ vay thành công và đã hoàn tất chấm điểm tín dụng tự động!',
      data: newApp
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC2.4 - Xem danh sách hồ sơ cá nhân
const getMyApplications = async (req, res) => {
  try {
    const apps = memoryStore.getApplicationsByCustomerId(req.user.id);
    return res.json({
      success: true,
      data: apps
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC5.3 - Xem chi tiết hồ sơ & Audit Log timeline
const getApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const app = memoryStore.getApplicationById(id);

    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin hồ sơ vay.' });
    }

    // Customer can only access their own loan unless they are officer/admin
    if (req.user.role === 'customer' && app.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hồ sơ này.' });
    }

    return res.json({
      success: true,
      data: app
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC5.2 - Bổ sung chứng từ theo yêu cầu
const resubmitDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedDocuments } = req.body;

    const app = memoryStore.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    }

    if (app.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật hồ sơ này.' });
    }

    app.documents = updatedDocuments || app.documents;
    app.status = 'UNDER_REVIEW';

    memoryStore.addAuditLog(id, {
      action: 'Bổ sung chứng từ',
      performedBy: req.user.fullName,
      role: req.user.role,
      note: 'Khách hàng đã cập nhật lại chứng từ đính kèm theo yêu cầu thẩm định.'
    });

    return res.json({
      success: true,
      message: 'Đã bổ sung chứng từ thành công. Hồ sơ đã chuyển lại trạng thái Chờ thẩm định.',
      data: app
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC5.1 - Xem danh sách thông báo
const getNotifications = async (req, res) => {
  try {
    const notifs = memoryStore.getNotificationsByUserId(req.user.id);
    return res.json({
      success: true,
      data: notifs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC5.1 - Đánh dấu thông báo đã đọc
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = memoryStore.markNotificationAsRead(id);
    return res.json({
      success: true,
      data: notif
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  simulateLoan,
  ocrExtract,
  submitApplication,
  getMyApplications,
  getApplicationDetail,
  resubmitDocuments,
  getNotifications,
  markNotificationRead
};

const memoryStore = require('../store/memoryStore');
const { evaluateCreditScore } = require('../engine/creditScoringEngine');
const { extractDocumentData } = require('../services/ocrService');
const { 
  broadcastNewApplication, 
  broadcastApplicationStatusChange, 
  getIo 
} = require('../realtime/socketManager');

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
      occupation,
      productId,
      productName,
      interestRate,
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

    // Bank Account details: prioritize explicit fields, then personalDetails, then user profile
    const disbursementBank = req.body.disbursementBank || personalDetails?.bankName || (user ? user.bankName : 'Vietcombank (Ngân hàng Ngoại Thương)');
    const disbursementAccount = req.body.disbursementAccount || personalDetails?.accountNumber || (user ? user.accountNumber : '');

    // Contract ID
    const contractId = 'HD-' + new Date().getFullYear() + '-LOMS-' + Math.floor(1000 + Math.random() * 9000);

    const newApp = memoryStore.createApplication({
      customerId,
      customerName: user ? user.fullName : (personalDetails?.fullName || req.user.fullName),
      customerPhone: user ? user.phone : (personalDetails?.phone || ''),
      identityCard: user ? user.identityCard : (personalDetails?.identityCard || ''),
      occupation: occupation || (user ? user.occupation : 'OTHER'),
      productId: productId || '',
      productName: productName || '',
      interestRate: interestRate || (scoringResult ? scoringResult.suggestedInterestRate : 0.85),
      requestedAmount: Number(requestedAmount),
      requestedTermMonths: Number(requestedTermMonths),
      approvedAmount: Number(requestedAmount),
      remainingPrincipal: Number(requestedAmount),
      paidMonths: 0,
      totalPaidAmount: 0,
      disbursementBank,
      disbursementAccount,
      contract: {
        contractId,
        signedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW', // Pending review by credit officer
        disbursementBank,
        disbursementAccount
      },
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
          action: 'Khởi tạo & Nộp hồ sơ vay (Bản hợp đồng chờ thẩm định)',
          performedBy: req.user.fullName,
          role: req.user.role,
          timestamp: new Date().toISOString(),
          note: `Khách hàng ký số điện tử hợp đồng chờ xét duyệt ${contractId}. TK nhận giải ngân: ${disbursementAccount} (${disbursementBank}).`
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

    // Clear user's active draft after successful submission
    memoryStore.deleteDraft(customerId);

    // Create Notification
    memoryStore.createNotification({
      recipientId: customerId,
      loanId: newApp._id,
      title: 'Hồ sơ đăng ký vay mới',
      message: `Hồ sơ ${newApp.applicationNo} đã được gửi tới hệ thống thẩm định với điểm rủi ro: Hạng ${scoringResult.riskGrade}.`
    });

    // Realtime Broadcast across all agents (Credit Officers & Admins)
    broadcastNewApplication(newApp);

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
      actorType: 'CUSTOMER',
      note: 'Khách hàng đã cập nhật lại chứng từ đính kèm theo yêu cầu thẩm định.'
    });

    // Notify all agents about document resubmission
    broadcastApplicationStatusChange(app, 'RESUBMIT_DOCUMENTS', {
      id: req.user.id,
      name: req.user.fullName,
      role: req.user.role
    });

    // Send notification to review officer
    const io = getIo();
    if (io) {
      io.to('role:credit_officer').emit('notification:new', {
        title: 'Hồ sơ đã được bổ sung chứng từ',
        message: `Khách hàng ${app.customerName} đã bổ sung chứng từ cho hồ sơ ${app.applicationNo}.`,
        loanId: app._id,
        timestamp: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      message: 'Đã bổ sung chứng từ thành công. Hồ sơ đã chuyển lại trạng thái Chờ thẩm định.',
      data: app
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC2.1 - Realtime Draft Sync (Lưu & Khôi phục bản nháp hồ sơ)
const saveDraft = async (req, res) => {
  try {
    const customerId = req.user.id;
    const draftData = req.body;
    const saved = memoryStore.saveDraft(customerId, draftData);

    // Emit to other devices/tabs of this user
    const io = getIo();
    if (io) {
      io.to(`user:${customerId}`).emit('loan:draft_synced_remote', {
        draft: saved,
        updatedAt: saved.updatedAt
      });
    }

    return res.json({
      success: true,
      message: 'Lưu bản nháp hồ sơ thành công theo thời gian thực.',
      data: saved
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDraft = async (req, res) => {
  try {
    const customerId = req.user.id;
    const draft = memoryStore.getDraft(customerId);
    return res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDraft = async (req, res) => {
  try {
    const customerId = req.user.id;
    memoryStore.deleteDraft(customerId);
    return res.json({
      success: true,
      message: 'Đã xóa bản nháp hồ sơ.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC5.3 - Trao đổi / Thảo luận / Phản hồi giữa các tác nhân (Actors Comments)
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung trao đổi không được để trống.' });
    }

    const app = memoryStore.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    }

    // Role check: Only customer owner, credit officer, or admin can comment
    if (req.user.role === 'customer' && app.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền trao đổi trong hồ sơ này.' });
    }

    const newComment = memoryStore.addComment(id, {
      senderId: req.user.id,
      senderName: req.user.fullName,
      senderRole: req.user.role,
      content: content.trim(),
      attachments: attachments || []
    });

    // Add brief audit log
    memoryStore.addAuditLog(id, {
      action: 'Tin nhắn trao đổi hồ sơ',
      performedBy: req.user.fullName,
      role: req.user.role,
      actorType: req.user.role === 'customer' ? 'CUSTOMER' : 'CREDIT_OFFICER',
      note: content.length > 80 ? `${content.substring(0, 80)}...` : content
    });

    // Realtime broadcast via Socket
    const io = getIo();
    if (io) {
      io.to(`loan:${id}`).emit('loan:comment_received', {
        loanId: id,
        comment: newComment
      });

      if (req.user.role === 'credit_officer' && app.customerId) {
        io.to(`user:${app.customerId}`).emit('notification:new', {
          title: `Phản hồi từ Chuyên viên thẩm định`,
          message: `Hồ sơ ${app.applicationNo}: "${content}"`,
          loanId: app._id,
          timestamp: new Date().toISOString()
        });
      } else if (req.user.role === 'customer') {
        io.to('role:credit_officer').emit('notification:new', {
          title: `Khách hàng gửi tin nhắn mới`,
          message: `Hồ sơ ${app.applicationNo} (${req.user.fullName}): "${content}"`,
          loanId: app._id,
          timestamp: new Date().toISOString()
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Gửi trao đổi thành công.',
      data: newComment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = memoryStore.getCommentsByAppId(id);
    return res.json({
      success: true,
      data: comments
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

// CDC State Reconciliation: Lấy bù đắp các event bị bỏ lỡ khi mất kết nối mạng
const reconcileApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const fromVersion = parseInt(req.query.fromVersion, 10) || 0;

    const app = memoryStore.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ.' });
    }

    const missedEvents = memoryStore.getMissedEvents(app._id, fromVersion);

    return res.json({
      success: true,
      documentId: app._id,
      applicationNo: app.applicationNo,
      currentVersion: app.version || 1,
      fromVersion,
      missedEnvelopes: missedEvents,
      latestDocument: app
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Gợi ý & danh sách gói vay theo phân loại người dùng (User Segmentation)
const getLoanProducts = async (req, res) => {
  try {
    const { occupation } = req.query;
    const allProducts = memoryStore.getAllLoanProducts(occupation);
    const recommended = occupation && occupation !== 'ALL'
      ? allProducts.filter(p => p.targetOccupations.includes(occupation))
      : allProducts;

    return res.json({
      success: true,
      selectedOccupation: occupation || 'ALL',
      products: allProducts,
      recommendedProducts: recommended
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Chi tiết gói vay theo ID
const getLoanProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = memoryStore.getLoanProductById(id);
    return res.json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC6.1 - Thanh toán trả nợ Real-Time & Cập nhật số dư khoản vay
const processRepayment = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { applicationId, amount, paymentType, note } = req.body;

    if (!applicationId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã hồ sơ vay và số tiền thanh toán hợp lệ.' });
    }

    const app = memoryStore.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ khoản vay.' });
    }

    if (req.user.role === 'customer' && app.customerId !== customerId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thanh toán cho khoản vay này.' });
    }

    const payAmount = Number(amount);
    const remainingBefore = Number(app.remainingPrincipal !== undefined ? app.remainingPrincipal : (app.approvedAmount || app.requestedAmount)) || 0;
    const remainingAfter = Math.max(0, remainingBefore - payAmount);

    const { transaction, updatedApplication } = await memoryStore.recordPaymentTransaction({
      applicationId: app._id,
      applicationNo: app.applicationNo,
      customerId,
      customerName: req.user.fullName,
      amount: payAmount,
      paymentType: paymentType || 'MONTHLY_INSTALLMENT',
      paymentMethod: 'VIETQR_NAPAS247',
      virtualAccount: {
        bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
        accountNumber: `99LOMS${app.identityCard || '000000000000'}`,
        accountHolder: `LOMS - ${req.user.fullName.toUpperCase()}`
      },
      remainingPrincipalAfter: remainingAfter,
      status: 'COMPLETED',
      note: note || `Thanh toán hợp đồng ${app.applicationNo}`
    });

    // Notify customer
    memoryStore.createNotification({
      recipientId: customerId,
      loanId: app._id,
      title: 'Thanh toán thành công 🎉',
      message: `Đã ghi nhận thanh toán ${payAmount.toLocaleString('vi-VN')} VNĐ cho hợp đồng ${app.applicationNo}. Dư nợ còn lại: ${remainingAfter.toLocaleString('vi-VN')} VNĐ.`
    });

    // Broadcast realtime event
    const io = getIo();
    if (io) {
      io.to(`user:${customerId}`).emit('loan:payment_completed', {
        transaction,
        application: updatedApplication
      });
      io.to('role:admin').emit('loan:payment_completed', {
        transaction,
        application: updatedApplication
      });
    }

    return res.json({
      success: true,
      message: 'Thanh toán thành công qua Virtual Account VietQR Napas 247!',
      data: {
        transaction,
        application: updatedApplication
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UC6.2 - Lấy thông tin thanh toán & giải ngân theo thời gian thực của khách hàng
const getCustomerLoanOverview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const apps = memoryStore.getApplicationsByCustomerId(customerId);
    const transactions = memoryStore.getPaymentTransactionsByCustomerId(customerId);

    // Active loan (DISBURSED or APPROVED)
    const activeLoan = apps.find(a => a.status === 'DISBURSED' || a.status === 'APPROVED');
    // Pending loan (SUBMITTED, UNDER_REVIEW, ACTION_REQUIRED)
    const pendingLoan = apps.find(a => ['SUBMITTED', 'UNDER_REVIEW', 'ACTION_REQUIRED'].includes(a.status));

    return res.json({
      success: true,
      data: {
        hasActiveLoan: !!activeLoan,
        activeLoan: activeLoan || null,
        hasPendingLoan: !!pendingLoan,
        pendingLoan: pendingLoan || null,
        allApplications: apps,
        transactions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLoanProducts,
  getLoanProductDetail,
  simulateLoan,
  ocrExtract,
  submitApplication,
  getMyApplications,
  getApplicationDetail,
  resubmitDocuments,
  saveDraft,
  getDraft,
  deleteDraft,
  addComment,
  getComments,
  getNotifications,
  markNotificationRead,
  reconcileApplication,
  processRepayment,
  getCustomerLoanOverview
};

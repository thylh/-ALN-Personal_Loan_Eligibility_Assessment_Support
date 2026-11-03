const { getIo } = require('../realtime/socketManager');
const memoryStore = require('../store/memoryStore');
const os = require('os');

// Bộ nhớ lưu trữ phiên thanh toán QR tạm thời
const paymentSessions = new Map();

/**
 * 1. Khởi tạo phiên thanh toán (createPaymentSession)
 */
const createPaymentSession = async (req, res) => {
  try {
    const { contractId, amount, customerName, note } = req.body;

    if (!contractId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin contractId hoặc amount để tạo phiên thanh toán.'
      });
    }

    const app = memoryStore.getApplicationById(contractId) || 
      memoryStore.getAllApplications().find(a => a.applicationNo === contractId);

    const sessionId = `PAY-SES-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const sessionData = {
      sessionId,
      contractId,
      applicationId: app ? app._id : contractId,
      applicationNo: app ? app.applicationNo : contractId,
      customerId: app?.customerId || req.user?.id || 'KH_UNKNOWN',
      customerName: customerName || app?.fullName || app?.personalInfo?.fullName || req.user?.fullName || 'Khách hàng',
      amount: Number(amount),
      note: note || `Thanh toan hop dong ${contractId}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    paymentSessions.set(sessionId, sessionData);

    return res.json({
      success: true,
      message: 'Khởi tạo phiên thanh toán di động thành công',
      data: {
        sessionId,
        contractId,
        amount: Number(amount),
        customerName: sessionData.customerName
      }
    });
  } catch (error) {
    console.error('Lỗi createPaymentSession:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy chi tiết phiên thanh toán để hiển thị trên điện thoại
 */
const getPaymentSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = paymentSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Phiên thanh toán không tồn tại hoặc đã hết hạn.'
      });
    }

    return res.json({
      success: true,
      data: session
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Hàm xử lý phía Backend (/api/payment/confirm):
 * Nhận request xác nhận từ Mobile, hỗ trợ nhận contractId (hoặc sessionId).
 * Cập nhật trạng thái hợp đồng trong DB thành PAID (hoặc SETTLED), giảm trừ dư nợ.
 * Sau đó phát tín hiệu qua WebSocket xuống trình duyệt máy tính đang mở.
 */
const handleMobileConfirm = async (req, res) => {
  try {
    const { contractId, sessionId, paymentMethod = 'NAPAS247_MOBILE' } = req.body;

    const targetContractId = contractId || sessionId;
    if (!targetContractId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin contractId hoặc sessionId.'
      });
    }

    // 1. Kiểm tra session nếu có
    let session = sessionId ? paymentSessions.get(sessionId) : null;
    if (!session && contractId) {
      for (const s of paymentSessions.values()) {
        if (s.contractId === contractId && s.status === 'PENDING') {
          session = s;
          break;
        }
      }
    }

    if (session) {
      session.status = 'PAID';
      session.paidAt = new Date().toISOString();
      session.paymentMethod = paymentMethod;
    }

    // 2. Tìm hợp đồng vay trong cơ sở dữ liệu
    const app = memoryStore.getApplicationById(targetContractId) || 
      memoryStore.getAllApplications().find(a => a.applicationNo === targetContractId || a._id === targetContractId);

    let updatedApplication = null;
    let transactionRecord = null;
    
    // Đảm bảo lấy đúng số tiền từ request/session, nếu không có mới lấy theo kỳ hạn hợp đồng
    let payAmount = Number(req.body.amount);
    if (!payAmount || isNaN(payAmount) || payAmount <= 0) {
      payAmount = session ? session.amount : 0;
    }
    if (!payAmount || payAmount <= 0) {
      if (app) {
        const orig = Number(app.approvedAmount || app.requestedAmount || 0);
        const term = Number(app.requestedTermMonths || 12);
        const monthlyPrinc = term > 0 ? Math.round(orig / term) : 0;
        const monthlyInt = Math.round((Number(app.remainingPrincipal || orig)) * 0.0085);
        payAmount = monthlyPrinc + monthlyInt;
      } else {
        payAmount = 4513940;
      }
    }

    if (app) {
      const remainingBefore = Number(app.remainingPrincipal !== undefined ? app.remainingPrincipal : (app.approvedAmount || app.loanAmount)) || 0;
      const remainingAfter = Math.max(0, remainingBefore - payAmount);

      const result = await memoryStore.recordPaymentTransaction({
        applicationId: app._id,
        applicationNo: app.applicationNo,
        customerId: app.customerId || 'KH_CUSTOMER',
        customerName: app.fullName || app.personalInfo?.fullName || 'Khách hàng',
        amount: payAmount,
        paymentType: remainingAfter === 0 ? 'EARLY_SETTLEMENT' : 'MONTHLY_INSTALLMENT',
        paymentMethod: 'NAPAS247_MOBILE_PAY',
        remainingPrincipalAfter: remainingAfter,
        status: 'COMPLETED',
        note: `Thanh toan QR Mobile thanh cong cho hop dong ${app.applicationNo}`
      });

      transactionRecord = result.transaction;
      updatedApplication = result.updatedApplication;

      // CẬP NHẬT TRẠNG THÁI HỢP ĐỒNG (KHÔNG TẠO MỚI HỒ SƠ)
      // Nếu đã thanh toán hết dư nợ (remainingAfter === 0) -> SETTLED (Đã tất toán)
      // Nếu chỉ trả theo đợt / kỳ hạn -> Giữ nguyên DISBURSED để quản lý khoản vay, cập nhật số dư
      if (remainingAfter === 0) {
        app.status = 'SETTLED';
        app.paymentStatus = 'SETTLED';
      } else {
        // Vẫn đang trong chu kỳ trả nợ (LMS)
        app.status = 'DISBURSED';
        app.paymentStatus = 'PARTIALLY_PAID';
      }
      app.remainingPrincipal = remainingAfter;
      app.paidMonths = (Number(app.paidMonths) || 0) + 1;
      app.totalPaidAmount = (Number(app.totalPaidAmount) || 0) + payAmount;
      app.updatedAt = new Date();
    }

    // 3. Quản lý kết nối Real-time: Phát tín hiệu qua WebSocket xuống trình duyệt máy tính
    const io = getIo();
    if (io) {
      console.log(`[Socket Realtime] Phát tín hiệu payment:success cho hợp đồng: ${targetContractId}`);
      
      const payload = {
        contractId: targetContractId,
        sessionId: session?.sessionId || `PAY-${targetContractId}`,
        amount: payAmount,
        status: 'PAID',
        customerName: app?.fullName || session?.customerName || 'Khách hàng',
        paidAt: new Date().toISOString(),
        transaction: transactionRecord,
        application: updatedApplication || app
      };

      // Bắn trực tiếp phòng riêng và phòng toàn cục
      io.to(`session:${targetContractId}`).emit('payment:success', payload);
      if (session?.sessionId) {
        io.to(`session:${session.sessionId}`).emit('payment:success', payload);
      }
      io.emit('payment:success', payload);
      io.emit('loan:payment_completed', payload);
    }

    return res.json({
      success: true,
      message: 'Thanh toán thành công! Trình duyệt máy tính đã được cập nhật.',
      data: {
        contractId: targetContractId,
        status: 'PAID',
        paidAt: new Date().toISOString(),
        amount: payAmount
      }
    });
  } catch (error) {
    console.error('Lỗi handleMobileConfirm:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Hủy bỏ thanh toán từ Mobile (handleCancelPayment)
 */
const handleCancelPayment = async (req, res) => {
  try {
    const { contractId, sessionId, reason = 'Người dùng từ chối thanh toán trên di động' } = req.body;
    const targetId = contractId || sessionId;

    let session = sessionId ? paymentSessions.get(sessionId) : null;
    if (session) {
      session.status = 'CANCELLED';
      session.cancelReason = reason;
    }

    const io = getIo();
    if (io) {
      console.log(`[Socket Realtime] Phát tín hiệu payment:cancelled cho: ${targetId}`);
      const payload = {
        contractId: targetId,
        sessionId: session?.sessionId || targetId,
        reason
      };
      io.to(`session:${targetId}`).emit('payment:cancelled', payload);
      io.emit('payment:cancelled', payload);
    }

    return res.json({
      success: true,
      message: 'Đã hủy phiên thanh toán thành công.',
      data: { contractId: targetId, status: 'CANCELLED' }
    });
  } catch (error) {
    console.error('Lỗi handleCancelPayment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPaymentSession,
  getPaymentSession,
  handleMobileConfirm,
  handleCancelPayment
};

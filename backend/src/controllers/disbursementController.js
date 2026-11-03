const { executeBatchPayout, generateNapasSignature } = require('../services/napasService');
const { memoryStore } = require('../store/memoryStore');
const LoanApplication = require('../models/LoanApplication');
const { getIO } = require('../realtime/socketManager');

// Lưu trữ lịch sử lô giải ngân
const batchHistoryMap = new Map();

/**
 * Lấy danh sách hồ sơ sẵn sàng để lập lệnh giải ngân
 */
async function getDisbursementQueue(req, res) {
  try {
    const allApps = memoryStore.getAllApplications();
    // Lấy các hồ sơ đã APPROVED hoặc E_SIGNED nhưng chưa DISBURSED
    const queue = allApps
      .filter(app => ['APPROVED', 'E_SIGNED', 'READY_FOR_DISBURSE'].includes(app.status))
      .map(app => ({
        id: app._id || app.id,
        customerName: app.fullName || app.personalInfo?.fullName || 'Khách hàng',
        phone: app.phone || app.personalInfo?.phone || '',
        amount: app.approvedAmount || app.loanAmount || 0,
        bankName: app.disbursementAccount?.bankName || app.contract?.disbursementBank || 'Vietcombank',
        accountNumber: app.disbursementAccount?.accountNumber || app.contract?.disbursementAccount || '001100' + Math.floor(100000 + Math.random() * 900000),
        accountHolder: (app.fullName || app.personalInfo?.fullName || 'NGUYEN VAN A').toUpperCase(),
        signedAt: app.contract?.signedAt || new Date().toISOString(),
        status: app.status === 'APPROVED' ? 'APPROVED' : 'READY',
        cccdMatched: true
      }));

    return res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.error('Error fetching disbursement queue:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách giải ngân' });
  }
}

/**
 * Xử lý yêu cầu giải ngân lô Batch Payout gửi sang Napas 247
 * Hỗ trợ Idempotency Key và cập nhật trạng thái hồ sơ thành DISBURSING
 */
async function handleBatchPayoutRequest(req, res) {
  try {
    const { loanIds, paymentGateway = 'NAPAS_247', idempotencyKey } = req.body;

    if (!loanIds || !Array.isArray(loanIds) || loanIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách hồ sơ giải ngân không hợp lệ hoặc rỗng.'
      });
    }

    // Kiểm tra Idempotency chống trùng lặp
    const clientKey = idempotencyKey || req.headers['x-idempotency-key'];
    if (clientKey && batchHistoryMap.has(clientKey)) {
      console.log(`[Idempotency Hit] Yêu cầu trùng lặp với key: ${clientKey}`);
      return res.json(batchHistoryMap.get(clientKey));
    }

    // Chuẩn bị danh sách giải ngân từ store
    const payoutList = [];
    const allApps = memoryStore.getAllApplications();

    for (const id of loanIds) {
      const app = allApps.find(a => (a._id || a.id) === id);
      if (app) {
        payoutList.push({
          loanId: id,
          customerName: app.fullName || app.personalInfo?.fullName,
          amount: app.approvedAmount || app.loanAmount || 20000000,
          bankName: app.disbursementAccount?.bankName || 'Vietcombank',
          accountNumber: app.disbursementAccount?.accountNumber || '1029384756',
          accountHolder: (app.fullName || app.personalInfo?.fullName || 'NGUYEN VAN').toUpperCase()
        });
      } else {
        // Dự phòng dữ liệu mô phỏng nếu id từ danh sách thử nghiệm
        payoutList.push({
          loanId: id,
          customerName: 'Khách hàng ' + id,
          amount: 25000000,
          bankName: 'MB Bank',
          accountNumber: '0987654321',
          accountHolder: 'CHU TAI KHOAN'
        });
      }
    }

    // Sinh mã lô duy nhất
    const batchId = `BATCH-NP-${Date.now().toString().slice(-8)}`;

    // Cập nhật trạng thái các hồ sơ thành DISBURSING
    for (const item of payoutList) {
      const app = allApps.find(a => (a._id || a.id) === item.loanId);
      if (app) {
        app.status = 'DISBURSING';
        app.disbursementBatchId = batchId;
        app.updatedAt = new Date();
      }
    }

    // Gửi sang tầng dịch vụ Napas
    const napasResult = await executeBatchPayout(batchId, payoutList, clientKey);

    const responseData = {
      success: true,
      message: `Khởi tạo lệnh giải ngân lô ${batchId} thành công qua ${paymentGateway}`,
      data: {
        batchId: batchId,
        idempotencyKey: clientKey,
        totalTransactions: payoutList.length,
        totalAmount: payoutList.reduce((acc, curr) => acc + curr.amount, 0),
        gatewayResponse: napasResult,
        status: 'DISBURSING',
        initiatedAt: new Date().toISOString()
      }
    };

    if (clientKey) {
      batchHistoryMap.set(clientKey, responseData);
    }

    // Phát socket realtime tới Dashboard Admin/Accountant
    try {
      const io = getIO();
      if (io) {
        io.emit('disbursement:batch_initiated', {
          batchId,
          totalCount: payoutList.length,
          totalAmount: responseData.data.totalAmount
        });
      }
    } catch (e) {
      // Ignored if socket not ready
    }

    // Tự động kích hoạt mô phỏng Webhook thành công sau 2.5 giây để hoàn tất chu trình giải ngân
    setTimeout(async () => {
      await autoCompleteBatchViaSimulation(batchId, payoutList);
    }, 2500);

    return res.json(responseData);
  } catch (error) {
    console.error('Lỗi thực hiện Batch Payout:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi thực thi lệnh giải ngân: ' + error.message
    });
  }
}

/**
 * Xử lý Webhook kết quả từ cổng Napas 247 gửi ngược
 */
async function handleNapasWebhook(req, res) {
  try {
    const { batchId, transactions, overallStatus, completedAt } = req.body;
    console.log(`[Napas Webhook] Nhận kết quả đối soát lô ${batchId}: Trạng thái = ${overallStatus}`);

    const allApps = memoryStore.getAllApplications();

    if (Array.isArray(transactions)) {
      for (const txn of transactions) {
        const app = allApps.find(a => (a._id || a.id) === txn.refTransactionId);
        if (app) {
          if (txn.status === 'SUCCESS') {
            app.status = 'DISBURSED';
            app.disbursedAmount = txn.amount || app.approvedAmount || app.loanAmount;
            app.disbursedAt = completedAt || new Date();
            app.napasTransactionRef = txn.napasTraceNo;
            app.remainingPrincipal = app.disbursedAmount;
          } else {
            app.status = 'DISBURSE_FAILED';
            app.disburseError = txn.errorMessage || 'Lỗi từ chối giao dịch Napas';
          }
        }
      }
    }

    // Bắn realtime thông báo giải ngân xong
    try {
      const io = getIO();
      if (io) {
        io.emit('disbursement:batch_completed', {
          batchId,
          overallStatus,
          timestamp: completedAt || new Date().toISOString()
        });
      }
    } catch (e) {}

    return res.json({
      success: true,
      responseCode: '00',
      message: 'Đã cập nhật trạng thái hợp đồng thành công từ Webhook Napas'
    });
  } catch (error) {
    console.error('Lỗi xử lý Napas Webhook:', error);
    return res.status(500).json({
      success: false,
      responseCode: '99',
      message: 'Lỗi máy chủ khi xử lý Webhook: ' + error.message
    });
  }
}

/**
 * Hàm mô phỏng tự động hoàn tất Webhook để test End-to-End
 */
async function autoCompleteBatchViaSimulation(batchId, payoutList) {
  const completedAt = new Date().toISOString();
  const webhookBody = {
    batchId: batchId,
    overallStatus: 'COMPLETED',
    completedAt: completedAt,
    transactions: payoutList.map(item => ({
      refTransactionId: item.loanId,
      napasTraceNo: `NP247-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      amount: item.amount,
      status: 'SUCCESS',
      responseCode: '00'
    }))
  };

  const allApps = memoryStore.getAllApplications();
  for (const txn of webhookBody.transactions) {
    const app = allApps.find(a => (a._id || a.id) === txn.refTransactionId);
    if (app) {
      app.status = 'DISBURSED';
      app.disbursedAmount = txn.amount;
      app.disbursedAt = completedAt;
      app.napasTransactionRef = txn.napasTraceNo;
      app.remainingPrincipal = txn.amount;
    }
  }

  try {
    const io = getIO();
    if (io) {
      io.emit('disbursement:batch_completed', {
        batchId,
        overallStatus: 'COMPLETED',
        transactions: webhookBody.transactions,
        timestamp: completedAt
      });
    }
  } catch (e) {}
}

module.exports = {
  getDisbursementQueue,
  handleBatchPayoutRequest,
  handleNapasWebhook
};


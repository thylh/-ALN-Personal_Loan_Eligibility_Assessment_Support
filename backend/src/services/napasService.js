const crypto = require('crypto');

/**
 * NAPAS & Core Banking Integration Service
 * Phục vụ nghiệp vụ R3.3 - Batch Payout & Tích hợp liên ngân hàng
 */

// Giả lập khóa bí mật tích hợp Napas (trong thực tế cấu hình qua biến môi trường)
const NAPAS_SECRET_KEY = process.env.NAPAS_SECRET_KEY || 'NAPAS_SECRET_KEY_SECURE_2026_PROD';
const NAPAS_MERCHANT_CODE = process.env.NAPAS_MERCHANT_CODE || 'FINTECH_LOMS_01';
const NAPAS_GATEWAY_URL = process.env.NAPAS_GATEWAY_URL || 'https://api-sandbox.napas.com.vn/v2/batch-payout';

/**
 * Tạo chữ ký số HMAC-SHA256 theo chuẩn bảo mật Napas
 * @param {object|string} payload Dữ liệu giao dịch cần ký
 * @param {string} secretKey Khóa bí mật đối tác Napas
 * @returns {string} Chữ ký số Hexadecimal
 */
function generateNapasSignature(payload, secretKey = NAPAS_SECRET_KEY) {
  const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');
}

/**
 * Xác thực chữ ký số từ Napas Webhook gọi ngược
 * @param {string} payloadString Nội dung body dạng chuỗi hoặc object
 * @param {string} signatureHeader Chữ ký nhận được từ header 'X-Napas-Signature'
 * @param {string} secretKey Khóa bí mật
 * @returns {boolean} True nếu chữ ký hợp lệ
 */
function verifyNapasSignature(payloadString, signatureHeader, secretKey = NAPAS_SECRET_KEY) {
  if (!signatureHeader) return false;
  const calculated = generateNapasSignature(payloadString, secretKey);
  try {
    return crypto.timingSafeEqual(Buffer.from(calculated, 'utf8'), Buffer.from(signatureHeader, 'utf8'));
  } catch (err) {
    return false;
  }
}

/**
 * Gửi lệnh giải ngân hàng loạt (Batch Payout) sang cổng Napas 247
 * Hỗ trợ Idempotency Key chống gọi trùng tiền
 * @param {string} batchId Mã định danh duy nhất của lô giải ngân
 * @param {Array} payoutList Danh sách các giao dịch giải ngân
 * @param {string} idempotencyKey Khóa chống trùng lặp từ client/hệ thống
 * @returns {Promise<object>} Kết quả phản hồi từ Napas Gateway
 */
async function executeBatchPayout(batchId, payoutList, idempotencyKey = '') {
  const timestamp = new Date().toISOString();
  const requestPayload = {
    merchantCode: NAPAS_MERCHANT_CODE,
    batchId: batchId,
    timestamp: timestamp,
    totalRecords: payoutList.length,
    totalAmount: payoutList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    transactions: payoutList.map((item, index) => ({
      sequence: index + 1,
      refTransactionId: item.loanId || item.id,
      beneficiaryBankCode: item.bankCode || item.bankName,
      beneficiaryAccountNumber: item.accountNumber,
      beneficiaryAccountName: item.accountHolder,
      amount: item.amount,
      currency: 'VND',
      paymentRemark: `GIAI NGAN KHOAN VAY ${item.loanId || item.id} NAPAS247`
    }))
  };

  const signature = generateNapasSignature(requestPayload, NAPAS_SECRET_KEY);
  const headers = {
    'Content-Type': 'application/json',
    'X-Merchant-Code': NAPAS_MERCHANT_CODE,
    'X-Napas-Signature': signature,
    'X-Idempotency-Key': idempotencyKey || `IDEMP-${batchId}-${Date.now()}`
  };

  // Giả lập xử lý Core Banking / Napas 247 thực tế với độ trễ viễn thông
  console.log(`[Napas Gateway] Dispatching Batch Payout: ${batchId} (${payoutList.length} txns) to ${NAPAS_GATEWAY_URL}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      // Giả lập phản hồi thành công từ Napas 247
      const napasBatchRef = `NP-BAT-${Date.now().toString().slice(-8)}`;
      resolve({
        statusCode: '00', // Mã 00: Napas tiếp nhận lô thành công
        message: 'Lô giải ngân được cổng Napas 247 tiếp nhận xử lý thành công',
        data: {
          batchId: batchId,
          napasBatchReference: napasBatchRef,
          receivedAt: timestamp,
          status: 'PROCESSING',
          processedCount: payoutList.length,
          successCount: payoutList.length,
          failedCount: 0,
          signature: generateNapasSignature({ batchId, napasBatchRef, status: 'PROCESSING' })
        }
      });
    }, 1200);
  });
}

module.exports = {
  NAPAS_SECRET_KEY,
  NAPAS_MERCHANT_CODE,
  generateNapasSignature,
  verifyNapasSignature,
  executeBatchPayout
};


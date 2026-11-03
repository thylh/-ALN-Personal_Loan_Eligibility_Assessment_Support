const express = require('express');
const router = express.Router();
const disbursementController = require('../controllers/disbursementController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { verifyNapasWebhookSignature } = require('../middleware/napasWebhookAuth');

// 1. Lấy danh sách hàng đợi giải ngân (Admin, Kế toán, Thẩm định)
router.get(
  '/queue',
  authenticateToken,
  authorizeRoles('admin', 'accountant', 'credit_officer'),
  disbursementController.getDisbursementQueue
);

// 2. Lập lệnh giải ngân lô gửi sang Napas 247
router.post(
  '/batch-payout',
  authenticateToken,
  authorizeRoles('admin', 'accountant'),
  disbursementController.handleBatchPayoutRequest
);

// 3. Webhook nhận kết quả từ Napas (Công khai nhưng được bảo vệ bằng chữ ký HMAC-SHA256)
router.post(
  '/napas/webhook',
  verifyNapasWebhookSignature,
  disbursementController.handleNapasWebhook
);

module.exports = router;


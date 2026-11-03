const express = require('express');
const router = express.Router();
const mobilePaymentController = require('../controllers/mobilePaymentController');

// Khởi tạo phiên thanh toán tạo URL QR (Cho phép cả khách và người dùng đăng nhập)
router.post('/session', mobilePaymentController.createPaymentSession);

// Lấy thông tin phiên thanh toán để render trên điện thoại di động
router.get('/session/:sessionId', mobilePaymentController.getPaymentSession);

// Endpoint di động bấm [Đồng ý thanh toán]
router.post('/confirm', mobilePaymentController.handleMobileConfirm);

// Endpoint di động bấm [Hủy bỏ]
router.post('/cancel', mobilePaymentController.handleCancelPayment);

module.exports = router;


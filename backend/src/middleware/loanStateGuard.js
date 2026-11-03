const memoryStore = require('../store/memoryStore');

/**
 * validateLoanStateGuard:
 * Middleware kiểm tra bảo vệ trạng thái khoản vay trước khi thẩm định.
 * Nếu khoản vay đã ở trạng thái APPROVED hoặc PAID / SETTLED, mọi request cố tình
 * tác động thẩm định lại sẽ bị từ chối với mã lỗi 400/409, ngăn chặn kẹt trạng thái.
 */
function validateLoanStateGuard(req, res, next) {
  const { id } = req.params;
  if (!id) return next();

  const app = memoryStore.getApplicationById(id);
  if (!app) {
    return res.status(404).json({
      success: false,
      code: 'LOAN_NOT_FOUND',
      message: 'Không tìm thấy hồ sơ khoản vay cần thẩm định.'
    });
  }

  // 1. Chặn khoản vay đã phê duyệt
  if (app.status === 'APPROVED') {
    return res.status(400).json({
      success: false,
      code: 'ALREADY_APPROVED',
      message: 'Khoản vay này đã được Phê duyệt trước đó. Hệ thống không cho phép thẩm định lại.',
      currentStatus: app.status,
      readOnly: true
    });
  }

  // 2. Chặn khoản vay đã tất toán hoặc đã thanh toán hoàn tất
  if (['COMPLETED', 'SETTLED', 'PAID'].includes(app.status) || (app.status === 'DISBURSED' && Number(app.remainingPrincipal) === 0)) {
    return res.status(400).json({
      success: false,
      code: 'ALREADY_SETTLED',
      message: 'Khoản vay này đã hoàn tất thanh toán / tất toán. Hệ thống chỉ cho phép xem thông tin chỉ đọc (Read-only).',
      currentStatus: app.status,
      readOnly: true
    });
  }

  // 3. Chặn khoản vay đang giải ngân hoặc đã giải ngân
  if (['DISBURSED', 'DISBURSING'].includes(app.status)) {
    return res.status(400).json({
      success: false,
      code: 'ALREADY_DISBURSED',
      message: 'Khoản vay đã giải ngân thành công qua ngân hàng, không thể thay đổi quyết định thẩm định.',
      currentStatus: app.status,
      readOnly: true
    });
  }

  next();
}

module.exports = {
  validateLoanStateGuard
};


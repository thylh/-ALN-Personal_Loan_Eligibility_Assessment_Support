const { verifyNapasSignature, NAPAS_SECRET_KEY } = require('../services/napasService');

/**
 * Middleware kiểm tra chữ ký số bảo mật của Webhook Napas 247
 */
function verifyNapasWebhookSignature(req, res, next) {
  const signature = req.headers['x-napas-signature'];
  if (!signature) {
    return res.status(401).json({
      success: false,
      code: 'MISSING_SIGNATURE',
      message: 'Thiếu Header chữ ký số X-Napas-Signature'
    });
  }

  const isValid = verifyNapasSignature(req.body, signature, NAPAS_SECRET_KEY);
  if (!isValid) {
    console.warn('[Security Warning] Napas Webhook signature verification failed!');
    return res.status(403).json({
      success: false,
      code: 'INVALID_SIGNATURE',
      message: 'Chữ ký số Napas HMAC-SHA256 không hợp lệ hoặc đã bị thay đổi trên đường truyền.'
    });
  }

  next();
}

module.exports = {
  verifyNapasWebhookSignature
};


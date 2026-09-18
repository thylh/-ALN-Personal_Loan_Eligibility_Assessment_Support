const jwt = require('jsonwebtoken');
const memoryStore = require('../store/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'hethongvayvon_secret_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu mã xác thực Token (Unauthorized).' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = memoryStore.findUserById(decoded.id);

    if (!user) {
      return res.status(403).json({ success: false, message: 'Người dùng không tồn tại hoặc đã bị đăng xuất.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Tài khoản với quyền '${req.user ? req.user.role : 'Guest'}' không có quyền truy cập chức năng này.`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};

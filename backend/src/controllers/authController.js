const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const memoryStore = require('../store/memoryStore');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, identityCard, occupation } = req.body;

    if (!email || !password || !fullName || !occupation) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu, họ tên và nghề nghiệp.' });
    }

    const existingUser = memoryStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký tài khoản.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = memoryStore.createUser({
      username: username || email.split('@')[0],
      email,
      passwordHash,
      role: 'customer',
      occupation: occupation || 'OTHER',
      fullName,
      phone: phone || '',
      identityCard: identityCard || ''
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role, occupation: newUser.occupation },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        occupation: newUser.occupation,
        fullName: newUser.fullName,
        phone: newUser.phone,
        identityCard: newUser.identityCard
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = memoryStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, occupation: user.occupation || 'EMPLOYED' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        occupation: user.occupation || 'EMPLOYED',
        fullName: user.fullName,
        phone: user.phone,
        identityCard: user.identityCard
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = memoryStore.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        occupation: user.occupation || 'EMPLOYED',
        fullName: user.fullName,
        phone: user.phone,
        identityCard: user.identityCard,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = memoryStore.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const { fullName, phone, identityCard, occupation } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (identityCard) updateData.identityCard = identityCard;
    if (occupation) updateData.occupation = occupation;

    memoryStore.updateUserProfile(user._id, updateData);

    return res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        occupation: user.occupation || 'EMPLOYED',
        fullName: user.fullName,
        phone: user.phone,
        identityCard: user.identityCard
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};

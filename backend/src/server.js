const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security Middleware (Helmet & Rate Limiter)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: { success: false, message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.' }
});
app.use(limiter);

// CORS & Body Parsers
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(uploadsDir));

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Hệ Thống Vay Vốn & Thẩm Định Tín Dụng Cá Nhân (HeThongVayVon)',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi xử lý máy chủ nội bộ.'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Backend Express API active on http://localhost:${PORT}`);
});

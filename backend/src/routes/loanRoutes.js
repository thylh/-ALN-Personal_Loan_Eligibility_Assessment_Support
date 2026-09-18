const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Storage config for uploaded documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Public simulator route
router.post('/simulate', loanController.simulateLoan);

// Protected routes (Customer & Auth)
router.post('/ocr-extract', authenticateToken, upload.single('document'), loanController.ocrExtract);
router.post('/apply', authenticateToken, loanController.submitApplication);
router.get('/my-applications', authenticateToken, loanController.getMyApplications);
router.get('/application/:id', authenticateToken, loanController.getApplicationDetail);
router.put('/application/:id/resubmit', authenticateToken, loanController.resubmitDocuments);

// Notifications
router.get('/notifications', authenticateToken, loanController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, loanController.markNotificationRead);

module.exports = router;

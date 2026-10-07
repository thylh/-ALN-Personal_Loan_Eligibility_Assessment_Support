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

// Public simulator & loan products routes
router.post('/simulate', loanController.simulateLoan);
router.get('/products', loanController.getLoanProducts);
router.get('/products/:id', loanController.getLoanProductDetail);

// Protected routes (Customer & Auth)
router.post('/ocr-extract', authenticateToken, upload.single('document'), loanController.ocrExtract);
router.post('/apply', authenticateToken, loanController.submitApplication);
router.get('/my-applications', authenticateToken, loanController.getMyApplications);
router.get('/application/:id', authenticateToken, loanController.getApplicationDetail);
router.put('/application/:id/resubmit', authenticateToken, loanController.resubmitDocuments);

// Realtime Draft Sync
router.post('/draft', authenticateToken, loanController.saveDraft);
router.get('/draft', authenticateToken, loanController.getDraft);
router.delete('/draft', authenticateToken, loanController.deleteDraft);

// CDC State Reconciliation
router.get('/application/:id/reconcile', authenticateToken, loanController.reconcileApplication);

// Actor Discussion Comments & Realtime Q&A
router.post('/application/:id/comments', authenticateToken, loanController.addComment);
router.get('/application/:id/comments', authenticateToken, loanController.getComments);

// Notifications
router.get('/notifications', authenticateToken, loanController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, loanController.markNotificationRead);

// Realtime Repayment & Customer Loan Overview
router.get('/customer/overview', authenticateToken, loanController.getCustomerLoanOverview);
router.post('/repayment', authenticateToken, loanController.processRepayment);

module.exports = router;

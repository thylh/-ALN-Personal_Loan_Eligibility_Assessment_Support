const express = require('express');
const router = express.Router();
const ekycController = require('../controllers/ekycController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Customer routes
router.post('/submit', authenticateToken, ekycController.submitEkyc);
router.get('/my-status', authenticateToken, ekycController.getMyEkyc);

// Credit officer & Underwriting review routes
router.get('/application/:appId', authenticateToken, ekycController.getEkycByApplication);

module.exports = router;


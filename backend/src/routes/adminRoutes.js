const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes require authentication and role check
router.use(authenticateToken);
router.use(authorizeRoles('credit_officer', 'admin'));

router.get('/applications', adminController.getAllApplications);
router.put('/applications/:id/appraise', adminController.appraiseApplication);

router.get('/scoring-rules', adminController.getScoringRules);
router.put('/scoring-rules', authorizeRoles('admin'), adminController.updateScoringRules);

router.get('/dashboard-stats', adminController.getDashboardStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getStats,
  getPendingProviders,
  verifyProvider,
  getUsers,
  updateUserStatus,
  createReport,
  getReports,
  updateReportStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Report endpoint for authenticated users to file a report
router.post('/reports', protect, createReport);

// All other routes protected for Admin role only
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/providers/pending', getPendingProviders);
router.patch('/providers/:id/verification', verifyProvider);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

module.exports = router;

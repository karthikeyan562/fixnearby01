const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
} = require('../controllers/requestController');
const { createQuotation, getQuotationsForRequest } = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id', protect, authorize('customer', 'admin'), updateRequest);
router.patch('/:id/status', protect, updateRequestStatus);

// Quotation sub-routes
router.post('/:id/quotations', protect, authorize('provider'), createQuotation);
router.get('/:id/quotations', protect, getQuotationsForRequest);

module.exports = router;

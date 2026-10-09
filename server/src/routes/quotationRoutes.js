const express = require('express');
const router = express.Router();
const {
  getProviderQuotations,
  updateQuotation,
  acceptQuotation,
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('provider'), getProviderQuotations);
router.patch('/:id', protect, authorize('provider'), updateQuotation);
router.post('/:id/accept', protect, authorize('customer'), acceptQuotation);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { createReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.post('/:id/cancel', protect, cancelBooking);

// Review sub-route
router.post('/:id/review', protect, authorize('customer'), createReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getProviders,
  getProviderById,
  updateProfile,
  updateAvailability,
  submitVerification,
  getProviderRequests,
  addPortfolioItem,
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProviders);
router.get('/me/requests', protect, authorize('provider'), getProviderRequests);
router.get('/:id', getProviderById);

router.put('/profile', protect, authorize('provider'), updateProfile);
router.put('/availability', protect, authorize('provider'), updateAvailability);
router.post('/portfolio', protect, authorize('provider'), upload.single('image'), addPortfolioItem);
router.post('/verification', protect, authorize('provider'), upload.single('verificationDoc'), submitVerification);

module.exports = router;

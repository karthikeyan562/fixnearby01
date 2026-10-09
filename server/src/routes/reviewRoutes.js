const express = require('express');
const router = express.Router();
const { getProviderReviews, getPublicTestimonials } = require('../controllers/reviewController');

router.get('/testimonials', getPublicTestimonials);
router.get('/providers/:id', getProviderReviews);

module.exports = router;


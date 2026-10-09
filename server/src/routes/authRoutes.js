const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/register', rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), register);
router.post('/login', rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;

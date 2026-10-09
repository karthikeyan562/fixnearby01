const express = require('express');
const router = express.Router();
const { handleAssistantMessage } = require('../controllers/assistantController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware so guest or logged in user can use voice assistant
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fixnearby_super_secret_jwt_key_2026');
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (e) {
      // ignore invalid token for assistant
    }
  }
  next();
};

router.post('/message', optionalAuth, handleAssistantMessage);

module.exports = router;

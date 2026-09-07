const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  login, refreshToken, logout, getProfile, changePassword,
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;

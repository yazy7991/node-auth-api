const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Refresh token route
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
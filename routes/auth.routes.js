const authController = require('../controllers/auth.controller');
const ensureAuthenticated = require('../middleware/authenticate');
const router = require('express').Router();

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Refresh token route
router.post('/refresh-token', authController.refreshToken);

// 2FA route-> get 2FA QR code
router.get('/2fa/generate', ensureAuthenticated, authController.get2FAQrCode);

// 2FA route-> validate 2FA QR code
router.post('/2fa/validate', ensureAuthenticated, authController.validate2FACode);

// Logout route
router.get('/logout', ensureAuthenticated,authController.logout);

module.exports = router;
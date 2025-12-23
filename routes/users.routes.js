const ensureAuthenticated = require('../middleware/authenticate');
const usersController = require('../controllers/users.controller');
const router = require('express').Router();

// Protected route to get current user details
router.get('/current', ensureAuthenticated ,usersController.currentUser)

module.exports = router;
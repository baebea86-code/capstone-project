const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;

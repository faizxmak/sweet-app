// Step 7: Auth routes
const express = require('express');
const router = express.Router();
const { register, login, verifyAdminCode } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-admin-code', verifyAdminCode);

module.exports = router;

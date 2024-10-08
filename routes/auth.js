const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/resend-otp/:email', authController.resendOtp);
router.put('/change-password', authMiddleware(), authController.changePassword);
router.post('/admin-only-route', authMiddleware('super_admin'), (req, res) => {res.send('Super admin access');});
router.get('/manager-only-route', authMiddleware('manager'), (req, res) => {res.send('Manager access');});
router.get('/staff-route', authMiddleware('staff'), (req, res) => {res.send('Staff access');});
router.put('/change-role', authMiddleware(['super_admin']), authController.changeUserRole);  
router.get('/users', authMiddleware(['super_admin']), authController.getAllUsers);

module.exports = router;

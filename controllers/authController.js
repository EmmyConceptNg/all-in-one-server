const User = require('../models/User');
const generateOtp = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Assign default role of 'staff' if role not provided
    const userRole = role || 'staff';

    user = new User({ firstName, lastName, email, password, role: userRole });
    user.otp = generateOtp();  
    user.otpCreatedAt = new Date();  

    await user.save(); 

    await sendEmail(user.email, 'OTP Verification', `Your OTP is ${user.otp}`);

    res.status(200).json({ msg: 'Registration successful, OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// OTP verification
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const otpExpiryDuration = 15 * 60 * 1000;  // 15 minutes
    const currentTime = Date.now();

    if (currentTime - new Date(user.otpCreatedAt).getTime() > otpExpiryDuration) {
      return res.status(400).json({ msg: 'OTP has expired' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    user.isVerified = true;  
    user.otp = undefined;  
    user.otpCreatedAt = undefined; 
    await user.save();

    res.status(200).json({ msg: 'OTP verified, account activated' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ msg: 'Account not verified' });

    // Include role in JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      token,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role, // Include role in response
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    user.otp = generateOtp();
    user.otpCreatedAt = new Date();  

    await user.save();  

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP is ${user.otp}`);

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    if (!user.isVerified) {
      user.otp = generateOtp();
      await user.save();

      await sendEmail(user.email, 'OTP Verification', `Your new OTP is ${user.otp}`);

      res.status(200).json({ msg: 'New OTP sent to your email' });
    } else {
      res.status(400).json({ msg: 'Account is already verified' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

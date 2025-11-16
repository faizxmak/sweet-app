// Step 7: Auth controller for register/login
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAdminCode, sendAdminCodeEmail } = require('../utils/emailService');

// Validation helpers
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 2-100 characters' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    
    // Generate admin code (6 digits)
    const adminCode = generateAdminCode();
    const adminCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      adminCode,
      adminCodeExpiry
    });
    await user.save();
    
    // Send admin code via email (don't expose code in logs)
    console.log(`📧 Sending admin code to ${email}...`);
    const emailSent = await sendAdminCodeEmail(email, adminCode);
    
    if (emailSent) {
      console.log(`✅ Email sent successfully to ${email}`);
    } else {
      console.log(`⚠️ Email failed but user registered.`);
    }
    
    res.status(201).json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin
      },
      message: 'Registration successful! Check your email for admin code.' 
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.verifyAdminCode = async (req, res) => {
  const { email, adminCode } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if code is expired
    if (!user.adminCodeExpiry || new Date() > user.adminCodeExpiry) {
      return res.status(400).json({ error: 'Admin code has expired' });
    }
    
    // Check if code matches
    if (user.adminCode !== adminCode) {
      return res.status(400).json({ error: 'Invalid admin code' });
    }
    
    // Update user to admin and clear the code
    user.is_admin = true;
    user.adminCode = null;
    user.adminCodeExpiry = null;
    await user.save();
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin
      },
      message: 'Admin status granted successfully!' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(400).json({ error: err.message });
  }
};

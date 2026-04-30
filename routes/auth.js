const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validation/schemas');
const bcrypt = require('bcrypt');
const passport = require('passport');

// Register GET
router.get('/register', (req, res) => {
  res.render('register', { errors: [] });
});

// Register POST
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(e => e.message);
      return res.render('register', { errors });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.render('register', { errors: ['Email already registered'] });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Create user
    const newUser = new User({
      name: value.name,
      email: value.email,
      phoneNumber: value.phoneNumber,
      gender: value.gender,
      monthlyIncome: value.monthlyIncome,
      password: hashedPassword
    });

    await newUser.save();
    req.flash('success', 'Registration successful! Please login.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { errors: ['An error occurred during registration'] });
  }
});

// Login GET
router.get('/login', (req, res) => {
  res.render('login', { message: req.flash('error') });
});

// Login POST
router.post('/login', passport.authenticate('local', {
  successRedirect: '/phones',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out');
    res.redirect('/login');
  });
});

module.exports = router;

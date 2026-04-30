const express = require('express');
const router = express.Router();
const Phone = require('../models/Phone');
const { phoneSchema } = require('../validation/schemas');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// GET all phones for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const phones = await Phone.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.render('phones/index', { phones, user: req.user });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// GET new phone form
router.get('/new', isAuthenticated, (req, res) => {
  res.render('phones/new', { errors: [], user: req.user });
});

// POST create new phone
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { error, value } = phoneSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(e => e.message);
      return res.render('phones/new', { errors, user: req.user });
    }

    const newPhone = new Phone({
      phoneName: value.phoneName,
      price: value.price,
      isIOS: value.isIOS || false,
      userId: req.user._id
    });

    await newPhone.save();
    req.flash('success', 'Phone added successfully!');
    res.redirect('/phones');
  } catch (err) {
    console.error(err);
    res.render('phones/new', { errors: ['An error occurred'], user: req.user });
  }
});

// GET phone by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const phone = await Phone.findOne({ _id: req.params.id, userId: req.user._id });
    if (!phone) {
      req.flash('error', 'Phone not found');
      return res.redirect('/phones');
    }
    res.render('phones/show', { phone, user: req.user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Invalid phone ID');
    res.redirect('/phones');
  }
});

// DELETE phone
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const phone = await Phone.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!phone) {
      req.flash('error', 'Phone not found');
      return res.redirect('/phones');
    }
    req.flash('success', 'Phone deleted successfully!');
    res.redirect('/phones');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred while deleting');
    res.redirect('/phones');
  }
});

module.exports = router;

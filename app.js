const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const User = require('./models/User');

const app = express();

// ========== Database Connection ==========
mongoose.connect('mongodb://localhost:27017/phone-manager')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// ========== View Engine Setup ==========
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// ========== Middleware ==========
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ========== Session Configuration ==========
app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ========== Passport Configuration ==========
// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialization
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Email not found' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// ========== Passport & Flash Middleware ==========
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ========== Response Locals Middleware ==========
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ========== Routes ==========
// Auth Routes
app.use('/', require('./routes/auth'));

// Phone Routes
app.use('/phones', require('./routes/phones'));

// Home Route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/phones');
  } else {
    res.redirect('/login');
  }
});

// ========== Error Handling ==========
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', {
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404', {
    message: 'Page not found'
  });
});

// ========== Server ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

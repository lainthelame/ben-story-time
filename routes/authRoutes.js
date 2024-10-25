const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// Hardcoded users with roles
const USERS = [
  { 
    username: 'admin', 
    password: '$2b$10$aex2hb12dgNtai37oH/B3uD9VeOfW5EndnCV.red6I9MC0JshGKAK', // password: 'password'
    role: 'admin' 
  },
  { 
    username: 'user', 
    password: '$2b$10$aex2hb12dgNtai37oH/B3uD9VeOfW5EndnCV.red6I9MC0JshGKAK', // password: 'password'
    role: 'user' 
  }
];

// Login form (public)
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/'); // Redirect if already logged in
  }
  res.render('login');
});

// Handle login submission
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = { username: user.username, role: user.role }; // Save role in session
    return res.redirect('/');
  }

  res.status(401).send('Invalid username or password'); // Show error if login fails
});

// Handle logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

module.exports = router;

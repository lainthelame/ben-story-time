const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session'); // Import sessions
const bcrypt = require('bcrypt'); // For password hashing
const blogRoutes = require('./routes/blogRoutes');

const app = express();
const PORT = 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public')); // Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploads
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'defaultsecret',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 60 * 60 * 1000 }
    })
  );

// // Session configuration
// app.use(
//   session({
//     secret: 'supersecretkey', // Replace with a stronger secret in production
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    db.run(
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        image TEXT
      )`
    );
  }
});

// Middleware to attach the database to the request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Middleware to provide user info to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user; // Make user available in all views
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);
app.use('/', blogRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


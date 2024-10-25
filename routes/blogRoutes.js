const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login'); // Redirect to login if not authenticated
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Access denied. Admins only.');
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage: storage });

// Home route - display all posts (accessible to all logged-in users)
router.get('/', isAuthenticated, (req, res) => {
  req.db.all('SELECT * FROM posts ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Database error.');
    }
    res.render('index', { posts: rows });
  });
});

// Route to display individual post (must include :id)
router.get('/post/:id', isAuthenticated, (req, res) => {
    const postId = req.params.id;
  
    // Query to get the post from the database
    req.db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
      if (err) {
        return res.status(500).send('Database error.');
      }
      if (!row) {
        return res.status(404).send('Post not found.');
      }
      res.render('post', { post: row });
    });
  });

// New post form (admin only)
router.get('/new', isAdmin, (req, res) => {
  res.render('new');
});

// Handle new post submission (admin only)
router.post('/new', isAdmin, upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? req.file.filename : '';
  const query = 'INSERT INTO posts (title, content, image) VALUES (?, ?, ?)';
  req.db.run(query, [title, content, image], (err) => {
    if (err) {
      return res.status(500).send('Error saving post.');
    }
    res.redirect('/');
  });
});

// Handle post deletion (admin only)
router.post('/delete/:id', isAdmin, (req, res) => {
  const postId = req.params.id;
  req.db.get('SELECT * FROM posts WHERE id = ?', [postId], (err, row) => {
    if (err || !row) {
      return res.status(404).send('Post not found.');
    }
    if (row.image) {
      fs.unlink(path.join(__dirname, '../uploads', row.image), () => {});
    }
    req.db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
      if (err) {
        return res.status(500).send('Error deleting post.');
      }
      res.redirect('/');
    });
  });
});

module.exports = router;

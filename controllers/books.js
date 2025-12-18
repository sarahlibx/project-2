const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const methodOverride = require('method-override');
const axios = require('axios');

// INDEX — GET /users/:userId/books
router.get('/', async (req, res) => {
try {
    const user = await User.findById(req.session.user._id);
    // show books from newest added to oldest
    let bookshelf = [...user.bookshelf].reverse();

    if (req.query.status && req.query.status !== 'all') {
      bookshelf = bookshelf.filter(
        book => book.status === req.query.status
      );
    }

    res.locals.bookshelf = user.bookshelf;
    res.locals.user = user;
      
    res.render('books/index.ejs', {
      title: `${user.username}'s Bookshelf`,
      user,
      bookshelf,
      selectedStatus: req.query.status || 'all'
    });

    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
    }
});

// GOOGLE API - NEW - GET - search books
router.get('/search', (req, res) => {
  try {
    res.render('books/search.ejs', { 
      title: 'Search Books',
      user: req.session.user,
      results: null, 
      query: '' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOOGLE API - POST /books/search
router.post('/search', async (req, res) => {
  try {
    const query = req.body.query;
    const response = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      { params: { q: query, maxResults: 10 } }
    );

    const results = response.data.items.map(item => ({
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || '/assets/no-book-cover.png',
      publishedDate: item.volumeInfo.publishedDate
    }));

    res.render('books/search.ejs', { title: 'Search Books', user: req.session.user, results, query, source: 'google' });
  } catch (err) {
    console.error(err);
    res.render('books/search.ejs', { results: [], query: '', error: err.message });
  }
});

// GOOGLE API - POST /books
router.post('/google', async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    user.bookshelf.push({
      title: req.body.title,
      authors: req.body.authors ? req.body.authors.split(',') : [],
      thumbnail: req.body.thumbnail || '/assets/no-book-cover.png',
      publishedDate: req.body.publishedDate || '',
      status: req.body.status || 'To Be Read',
      source: 'google'
    });

    await user.save();
    req.session.message = 'Book successfully added!';
    res.redirect(`/users/${user._id}/books`);
  } catch (err) {
    console.error(err);
    req.session.message = err.message;
    res.redirect(`/users/${req.session.user._id}/books`);
  }
});

// NEW - GET /users/:userId/books/new
router.get('/new', (req, res) => {
    res.render('books/new.ejs', {
      title: 'Add New Book',
      userId: req.session.user._id 
    });
});

// CREATE - POST /users/:userId/books
router.post('/manual', async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);

    user.bookshelf.push({ 
        title: req.body.title,
        authors: req.body.authors ? req.body.authors.split(',') : [],
        thumbnail: req.body.thumbnail || '',
        publishedDate: req.body.publishedDate || '',
        status: req.body.status,
        review: req.body.review || '',
        rating: req.body.rating ? Number(req.body.rating) : undefined,
        source: 'manual'
    });
    await user.save();

    req.session.message = "Book successfully added.";
    res.redirect(`/users/${user._id}/books`);

  } catch (error) {
    console.log(error);
    req.session.message = error.message;
    res.redirect('/books');
  }
});

// SHOW - GET /users/:userId/books/:bookId
router.get('/:itemId', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);
      
      res.render('books/show.ejs', {
        title: `${book.title}`,
        user,
        book
      });
    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
    }
  });

   // DELETE /users/:userId/books/:itemId
  router.delete('/:itemId', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      
      user.bookshelf.id(req.params.itemId).deleteOne();
      await user.save();
      
      res.redirect(`/users/${user._id}/books`);

    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
    }
  });

  // EDIT - GET /users/:userId/books/:itemId/edit
  router.get('/:itemId/edit', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);

      res.render('books/edit.ejs', { 
        title: 'Edit book', user, book });

    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
    }
  });

   // UPDATE - PUT /users/:userId/books/:itemId
  router.put('/:itemId', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);

      book.set(req.body);
      
      await user.save();
      req.session.message = "Book successfully edited.";
      res.redirect(
        `/users/${user._id}/books/${req.params.itemId}`
      );
    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
    }
  });

module.exports = router;
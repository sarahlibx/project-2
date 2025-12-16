const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const methodOverride = require('method-override');

// INDEX — GET /users/:userId/books
router.get('/', async (req, res) => {
try {
    const user = await User.findById(req.session.user._id);

    res.locals.bookshelf = user.bookshelf;
    res.locals.user = user;
      
    res.render('books/index.ejs', {
      title: `${user.username}'s Bookshelf`
    });

    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
      // res.redirect('/');
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
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    user.bookshelf.push({ 
        title: req.body.title,
        author: req.body.author,
        status: req.body.status,
        review: req.body.review,
        rating: req.body.rating ? Number(req.body.rating) : undefined
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
        title: `Edit: ${book.title}`,
        user,
        book
      });
    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
      // res.redirect('/');
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
      // res.redirect('/');
    }
  });

  // EDIT - GET /users/:userId/books/:itemId/edit
  router.get('/:itemId/edit', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);

      // res.locals.book = book;

      res.render('books/edit.ejs', { 
        title: 'Edit book', user, book });

    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
      // res.redirect('/');
    }
  });

   // UPDATE - PUT /users/:userId/books/:itemId
  router.put('/:itemId', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);

      book.set(req.body);
      
      await user.save();
      res.redirect(
        `/users/${user._id}/books/${req.params.itemId}`
      );
    } catch (error) {
      console.log(error);
      res.render("error.ejs", { msg: error.message });
      // res.redirect('/');
    }
  });

module.exports = router;
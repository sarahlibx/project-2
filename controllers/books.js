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
      
    res.render('books/index.ejs');

    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
});

// NEW - GET /users/:userId/books/new
router.get('/new', (req, res) => {
    res.render('books/new.ejs', { userId: req.session.user_id });
});

// CREATE - POST /users/:userId/books
router.post('/', async (req, res) => {
    console.log(req.body);
    const user = await User.findById(req.session.user._id);
    user.bookshelf.push({ 
        title: req.body.title,
        author: req.body.author,
        status: req.body.status 
    });
    await user.save();

    res.redirect(`/users/${user._id}/books`);
});

  // SHOW - GET /users/:userId/books/:itemId
  router.get('/:itemId', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);
      
      res.render('books/show.ejs', {
        book
      });
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });

   // DELETE /users/:userId/books/:itemId
  router.delete('/:itemId', async (req, res) => {
    try {
      // Look up the user from req.session
      const user = await User.findById(req.session.user._id);
      // Use the Mongoose .deleteOne() method to delete
      // a book using the id supplied from req.params
      user.bookshelf.id(req.params.itemId).deleteOne();
      // Save changes to the user
      await user.save();
      // Redirect back to the applications index view
      res.redirect(`/users/${user._id}/books`);
    } catch (error) {
      // If any errors, log them and redirect back home
      console.log(error);
      res.redirect('/');
    }
  });

  // EDIT - GET /users/:userId/books/:itemId/edit
  router.get('/:itemId/edit', async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      const book = user.bookshelf.id(req.params.itemId);

      res.locals.book = book;

      res.render('books/edit.ejs');

    } catch (error) {
      console.log(error);
      res.redirect('/');
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
      res.redirect('/');
    }
  });

module.exports = router;
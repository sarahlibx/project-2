// controllers/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const methodOverride = require('method-override');

// INDEX — GET /users/
  router.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        res.render('users/index.ejs', { title: 'Fellow Readers', users });

    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });

   // SHOW - GET /users/:userId
  router.get('/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).populate('bookshelf');

      res.render('users/show.ejs', {
        title: `${user.username}'s Bookshelf`,
        user
      });
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });

module.exports = router;
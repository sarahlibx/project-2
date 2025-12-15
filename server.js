const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";

const authController = require("./controllers/auth.js");
const booksController = require("./controllers/books.js");
const usersController = require("./controllers/users.js");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan('dev'));
// middleware that creates a session for every request
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);
// middleware that makes the user available to all view routes
app.use(passUserToView);
// flash message middleware
app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    req.session.message = null;
  }
  next();
});

// GET /landing page
app.get("/", async (req, res) => {
  res.render("index.ejs", {
    title: 'TBR Book Tracker'
  });
});

// auth routes
app.use("/auth", authController);
app.use(isSignedIn);
app.use('/users/:userId/books', booksController);
app.use('/users', usersController);

// undefined route handler
app.all(/.*/, function (req, res) {
  res.status(404).render("error.ejs", { title: 'Error Page', msg: "Page not found!" });
});

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});

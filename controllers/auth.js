const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// GET landing page for sign up
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs", {
    title: "Sign Up"
  });
});

// POST create a new account w/checks for username & password validation
router.post("/sign-up", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
        return res.send("Username already taken.");
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Password and Confirm Password must match");
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        req.body.password = hashedPassword;

    const user = await User.create(req.body);

    req.session.user = {
        _id: user._id, 
        username: user.username,
    };

    req.session.save(() => {
    res.redirect("/");
    });
});

// GET sign in page
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs", {
    title: "Sign In"
  });
});

// POST sign in w/checks for username & password validation
router.post("/sign-in", async (req, res) => {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (!userInDatabase) {
        return res.send("Login failed, user not found.");
    }

    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    );

    if (!validPassword) {
        return res.send("Login failed. Invalid password.");
    }

    req.session.user = {
        _id: userInDatabase._id, 
        username: userInDatabase.username,
    };

    req.session.save(() => {
    res.redirect("/");
    });
});

// GET sign out page
router.get("/sign-out", (req, res) => {
    req.session.destroy();
    // clear cookie session
    res.clearCookie("connect.sid", {
            path: "/", 
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

    res.redirect("/");
});

module.exports = router;

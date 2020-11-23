require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require('express-ejs-layouts')
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./passport-setup");

process.env.PWD = process.cwd();
app.use(express.static(process.env.PWD + "/public"));

// Set Templating Engine
app.use(expressLayouts)
app.set('layout', './layout')

// For an actual app you should configure this with an experation time, better keys, proxy and secure
app.use(
  cookieSession({
    name: "tuto-session",
    keys: ["key1", "key2"],
  })
);

app.set("view engine", "ejs");
// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render('pages/index', { title: 'Login Page'})
});
app.get("/failed", (req, res) => {
  res.render("pages/failed", { title: 'Login Failed'});
});

// If the user is logged in, you can access his info by using: req.user
app.get("/profile", (req, res) => {
  res.render("pages/profile", {
    title: 'Profile Page',
    name: req.user.displayName,
    pic: req.user.photos[0].value,
    email: req.user.emails[0].value,
  });
});

// Auth Routes
app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect to profile page.
    res.redirect("/profile");  
  }
);
//logout user and redirect to login
app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

app.listen(process.env.PORT||5000);

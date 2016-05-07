var express = require('express');
var router = express.Router();
var passport = require('passport');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.user.admin);
    return next();
  }
  res.redirect('/');
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    if(req.user.group == "admin")
      return next();
  }
  res.redirect('/');
}


router.get('/', function(req, res) {
  res.render('index'); // load the index.ejs file
});

router.get('/login', function(req, res) {
  // render the page and pass in any flash data if it exists
  res.render('login', { message: req.flash('loginMessage') });
});
router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/login', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

router.get('/signup', function(req, res) {
  // render the page and pass in any flash data if it exists
  res.render('signup', { message: req.flash('signupMessage') });
});
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/profile', // redirect to the secure profile section
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}));

router.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile', {
    user : req.user // get the user out of session and pass to template
  });
});

// =====================================
// TWITTER ROUTES ======================
// =====================================
// route for twitter authentication and login
router.get('/auth/twitter', passport.authenticate('twitter'));

// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

// =====================================
// GOOGLE ROUTES ======================
// =====================================

router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// app/routes.js
module.exports = router;


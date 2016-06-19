var express = require('express');
var router = express.Router();
var passport = require('passport');
var http = require('http');
var _ = require('underscore');
var Validate = require('../config/validate');

router.get('/', function(req, res) {
  res.render('index', { title: "Home" });
  //res.render('index'); // load the index.ejs file
});

router.get('/admin', function(req, res){
  //res.render('admin');
  var races;
  var venues;
  var results = 
  {
    races: [],
    venues: []
  };
  Race.find({}).sort({index:'ascending'}).exec(function(err, docs)
    {            
        _.every(docs, function(doc)
        {
          if(doc.venue !== null && doc.venue !== undefined){
            results.races.push
            ({
                name: doc.name,
                venue: doc.venue.name
            });
          } else {
            results.races.push
            ({
                name: doc.name
            });
          }
            return true;
        });
        Venue.find({}).sort({index:'ascending'}).exec(function(err, docs)
        {            
            _.every(docs, function(doc)
            {
                results.venues.push
                ({
                    name: doc.name,
                    category: doc.category
                });
                return true;
            });
            console.log(results.races);
            res.render('admin', { results: results });
        });
    });
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

router.get('/profile', Validate.admin, function(req, res) {
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
//module.exports = router;
module.exports = function(mongoose)
{
	Race = mongoose.model('Race');
  Venue = mongoose.model('Venue');
	return router;
};

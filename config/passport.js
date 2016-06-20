// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var CustomStrategy = require('passport-custom');

// basic auth.
var basicAuth = require('basic-auth');

// load up the user model
// var User  = require('../models/user');

// load the auth variables
var configAuth = require('./settings');


function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
};

function forbidden(res) {
    res.set('WWW-Authenticate', 'Basic realm=Forbidden Access');
    return res.send(403);
};

// expose this function to our app using module.exports
module.exports = function(passport, mongoose) {
    User = mongoose.model('User');

    /* CUSTOM LOGIN METHOD */

    passport.use('user', new CustomStrategy(function(req, done) {

            if (req.isAuthenticated()) {
                return done(null, req.user);
            }

            var bAuth = basicAuth(req);

            if (!bAuth || !bAuth.name || !bAuth.pass) {
                return done(null, false);
            };

            // Do your custom user finding logic here, or set to false based on req object
            User.findOne({ 'local.email' :  bAuth.name }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(null, false);

                // if no user is found, return the message
                if (!user)
                    return done(null, false);

                // if the user is found but the password is wrong
                if (!user.validPassword(bAuth.pass))
                    return done(null, false);

                // all is well, return successful user
                req.logIn(user , { session: false }, function () {
                    return done(null, user);
                });
            });
        }
    ));

    passport.use('admin', new CustomStrategy(function(req, done) {

        if (req.isAuthenticated()) {
            return done(null, req.user);
        }

        var bAuth = basicAuth(req);

        if (!bAuth || !bAuth.name || !bAuth.pass) {
            return done(null, false);
        };

        // Do your custom user finding logic here, or set to false based on req object
        User.findOne({ 'local.email' :  bAuth.name }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(null, false);

            // if no user is found, return the message
            if (!user)
                return done(null, false);

            // if the user is found but the password is wrong
            if (!user.validPassword(bAuth.pass))
                return done(null, false);


            if(user.isAdmin()) {
                // all is well, return successful user
                req.logIn(user, {session: false}, function () {
                    return done(null, user);
                });
            }
            else {
                return done(null, false);
            }
        });
        }
    ));

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function () {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({'local.email': email}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.name = email;
                        newUser.group = "user";
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            req.login(newUser, function () {
                                return done(null, newUser);
                            });

                        });
                    }

                });

            });

        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({'local.email': email}, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                req.login(user, function () {
                    return done(null, user);
                });
            });

        }));


    passport.validateUser = function (username, password, req, res, next) {

         User.findOne({ 'local.email' :  username.valueOf() }, function(err, user) {
             // if there are any errors, return the error before anything else
             if (err)
                 return unauthorized(res);

             // if no user is found, return the message
             if (!user)
                 return unauthorized(res);

             // if the user is found but the password is wrong
             if (!user.validPassword(password.valueOf()))
                 return unauthorized(res);

             // all is well, return successful user
             req.login(user, function () {
                 return next();
             });
         });
    };

    passport.validateAdmin = function (username, password, req, res, next) {

        User.findOne({ 'local.email' :  username.valueOf() }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return unauthorized(res);

            // if no user is found, return the message
            if (!user)
                return unauthorized(res);

            // if the user is found but the password is wrong
            if (!user.validPassword(password.valueOf()))
                return unauthorized(res);

            // all is well, return successful user
            if(user.isAdmin()) {
                req.login(user, function () {
                    return next();
                });
            }
            else {
                return forbidden(res);;
            }
        });
    };



    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL

        },
        function(token, tokenSecret, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Twitter
            process.nextTick(function() {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();
                        newUser.group = "user";
                        newUser.name = profile.username;
                        
                        // set all of the user data that we need
                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        // save our user into the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            });

        }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL,

        },
        function(token, refreshToken, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {

                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser          = new User();
                        newUser.group = "user";
                        newUser.name = profile.displayName;
                        
                        // set all of the relevant information
                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));


};
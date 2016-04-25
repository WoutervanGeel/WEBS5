"use strict";

var Base = require('./Base');
var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var User = require('../models/User');

class Auth extends Base {

    /**
     * Authentication class
     * Dealing with user login and logouts
     * @param router
     */
    constructor(app) {
        super(router);

        // apply middleware if necessary
        router.use(function (req, res, next) {
            // console.log('auth method called');
            next();
        });

        // add routes to router
        this.resolve();

        // commit router to application
        app.use('/auth', router);
    }

    /**
     * Resolve routes
     */
    resolve() {

        // allow logging in
        this.regRoute('post', '/login', [
            'username', 'password'
        ], [], this.postLogin.bind(this));

        // allow registering
        this.regRoute('post', '/users', [
            'username', 'password'
        ], [], this.postUser.bind(this));

        // get current authenticated user
        this.regRoute('get', '/users/current', [], [], this.getCurrentUser.bind(this), true);
    }

    /**
     * Submit credentials in order to login
     * @param request
     * @param input
     * @param response
     */
    postLogin(request, input, response) {
        passport.authenticate('local', function (e, user, error, something) {
            if (error) {
                return response.json({
                    success: false,
                    message: 'invalid credentials'
                });
            }

            // create new token
            var token = user.generateToken();
            user.save();

            // send success
            response.json({
                success: true,
                data: {
                    token: token
                }
            });
        }).apply(this, [request, response]);
    }

    /**
     * Submit new user
     * @param request
     * @param input
     * @param response
     */
    postUser(request, input, response) {
        User.usernameIsUnique(input['username'], function (error, success) {
            if (success) {
                // username is not duplicate

                let user = new User({
                    username: input['username'],
                    token: ''
                });

                user.setPassword(input['password'], function (err) {
                    user.save(function (err) {
                        if (err) {
                            return response.status(500).json({
                                success: false
                            });
                        }

                        response.json({
                            success: true
                        });
                    });
                });

            } else {
                // username is duplicate

                response.status(409).json({
                    success: false,
                    message: 'Username is already chosen, please choose another one'
                });
            }
        });
    }

    /**
     * Get the current user
     * @param request
     * @param input
     * @param response
     */
    getCurrentUser(request, input, response) {
        response.json({
            username: request.user.username
        });
    }
}

module.exports = Auth;
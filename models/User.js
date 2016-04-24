"use strict";

var mongoose = require('../lib/mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var bcrypt = require('../lib/bcrypt');
const tokenLength = 50;

var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: [5, 'Username too short'],
        maxlength: [20, 'Username too long']
    },
    password: String,
    token: String
});

/**
 * Return the first user which has the given username
 * @param username
 * @param callback
 * @returns {Query|*|FindOperatorsUnordered|FindOperatorsOrdered|Cursor|T}
 */
userSchema.statics.findByUsername = function (username, callback) {
    return this.find({username: username}, callback);
};

/**
 * Check whether the username is in distinct
 * @param username
 * @param callback
 */
userSchema.statics.usernameIsUnique = function (username, callback) {
    User.findByUsername(username, function (error, users) {
        if (error) {
            callback(error, false);
        } else if (users.length == 0) {
            callback(null, true);
        } else {
            callback({
                message: 'username is duplicate'
            }, false);
        }
    });
};

/**
 * Update a user's password
 * @param password
 * @param callback
 */
userSchema.methods.setPassword = function (password, callback) {
    bcrypt.hash(password, function (err, hash) {
        this.password = (!err) ? hash : '';
        callback(err);
    }.bind(this));
};

/**
 * Password validation
 * @param password
 * @param successCallback
 * @param failureCallback
 */
userSchema.methods.validPassword = function (password, successCallback, failureCallback) {
    bcrypt.validate(password, this.password, function (error, success) {

        if (success) {
            successCallback();
        } else {
            failureCallback();
        }

    });
};

/**
 * Token validation
 * @param token
 * @returns {boolean}
 */
userSchema.methods.verifyToken = function (token) {
    return token.length == tokenLength && this.token == token;
};

/**
 * Generate a new access token
 */
userSchema.methods.generateToken = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < tokenLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    this.token = text;
};

// apply auto-increment
userSchema.plugin(autoIncrement.plugin, 'User');

// register model
var User = mongoose.model('User', userSchema);

module.exports = User;

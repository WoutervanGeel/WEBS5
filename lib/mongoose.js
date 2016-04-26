"use strict";

const config = require('./config');
var mongoose = require('mongoose');
var assert = require('assert');

var url = 'mongodb://' + config.mongodb.username + ':' + config.mongodb.password + '@' + config.mongodb.host + '/' + config.mongodb.database;
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect(url, function (err) {
    assert.equal(null, err);
    console.log('Connection to database established');
});
autoIncrement.initialize(mongoose);

module.exports = mongoose;
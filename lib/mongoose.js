"use strict";

const username = 'API';
const password = 'zW3nGe1P4Ssw0rD';

var mongoose = require('mongoose');
var assert = require('assert');

var url = 'mongodb://' + username + ':' + password + '@ds013310.mlab.com:13310/heroku_sc24nhq2';
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect(url, function(err) {
    assert.equal(null, err);
    console.log('Connection to database established');
});
autoIncrement.initialize(mongoose);

module.exports = mongoose;
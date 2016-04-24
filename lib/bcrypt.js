var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    hash: function (password, callback) {
        bcrypt.hash(password, saltRounds, callback);
    },
    validate: function (password, hash, callback) {
        bcrypt.compare(password, hash, callback);
    }
};

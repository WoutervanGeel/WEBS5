var basicAuth = require('basic-auth');
var passport = require('passport');

const auth_user = "user";
const auth_user_key = "user";
const auth_admin = "admin";
const auth_admin_key = "admin";

function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
};

function forbidden(res) {
    res.set('WWW-Authenticate', 'Basic realm=Forbidden Access');
    return res.send(403);
};

module.exports = {

    requireUser: function(req, res, next) {

        if (req.isAuthenticated()) {
            return next();
        }

        var user = basicAuth(req);

        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        };

        if ((user.name === auth_user && user.pass === auth_user_key) ||
            (user.name === auth_admin && user.pass === auth_admin_key)) {
            return next();
        } else {
            return unauthorized(res);
        };
    },

    requireAdmin: function(req, res, next) {

        if (req.isAuthenticated()) {
            if (req.user.group == "admin")
                return next();
            else
                forbidden(res);
        }

        var user = basicAuth(req);

        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        };

        if (user.name === auth_admin && user.pass === auth_admin_key) {
            return next();
        } else {
            return forbidden(res);
        };
    }
};
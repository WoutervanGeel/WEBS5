var basicAuth = require('basic-auth');
var passport = require('passport');

function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
};

function forbidden(res) {
    res.set('WWW-Authenticate', 'Basic realm=Forbidden Access');
    return res.send(403);
};

module.exports = {

    user: null,

    requireUser: function(req, res, next) {

        if (req.isAuthenticated()) {
            return next();
        }

        var bUser = basicAuth(req);

        if (!bUser || !bUser.name || !bUser.pass) {
            return unauthorized(res);
        };

        passport.validateUser(bUser.name, bUser.pass, req, res, next);

    },

    requireAdmin: function(req, res, next) {

        if (req.isAuthenticated()) {
            if (req.user.group == "admin")
                return next();
            else
                forbidden(res);
        }

        var bUser = basicAuth(req);

        if (!bUser || !bUser.name || !bUser.pass) {
            return unauthorized(res);
        };

        passport.validateUser(bUser.name, bUser.pass, req, res, next);
    }
};
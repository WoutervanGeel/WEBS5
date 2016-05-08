var userKey = "user";
var adminKey = "admin";

module.exports = {

    user: function(req, res, next) {
        if (req.headers["auth"] == adminKey || req.headers["auth"] == userKey) {
            return next();
        }
        if(req.headers.hasOwnProperty("auth"))
        {
            res.statusCode = 401;
            res.end('{"error":"No valid authentication key"}');
            return;
        }
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },

    admin: function(req, res, next) {
        if (req.headers["auth"] == adminKey) {
            return next();
        }
        if(req.headers.hasOwnProperty("auth"))
        {
            res.statusCode = 401;
            res.end('{"error":"No valid authentication key"}');
            return;
        }
        if (req.isAuthenticated()) {
            if (req.user.group == "admin")
                return next();
        }
        res.redirect('/');
    }
};
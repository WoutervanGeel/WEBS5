// expose our config directly to our application using module.exports
module.exports = {

    'twitterAuth' : {
        'consumerKey'       : 'WZORisciMS2X5HxFdvr4yUtlr',
        'consumerSecret'    : '7WKjJJeBzLKa8EgZkgzhsbE1tU5m75jGRkejgAZJLmpeN7YtGg',
        'callbackURL'       : 'http://127.0.0.1:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '637434521016-qjbv08al2u2clrp9hh0i5sj9m0g36b32.apps.googleusercontent.com',
        'clientSecret'  : 'DEzj0SmTaKdHRsld-hRmJQlF',
        'callbackURL'   : 'http://127.0.0.1:3000/auth/google/callback'
    }

};
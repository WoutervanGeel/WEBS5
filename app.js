var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var bcrypt   = require('bcrypt-nodejs');

const username = 'wouter';
const password = 'admin';

// Heroku link: https://venuerace-gw.herokuapp.com/

var url = 'mongodb://' + username + ':' + password + '@ds017432.mlab.com:17432/venuerace_database';

mongoose.connect(url, function(err) {
    if(err){
        console.log(err);        
    }
    console.log('Connection to database established');
});



// Models
//require('./models/pokemon')(mongoose);
require('./models/user')(mongoose, bcrypt);
require('./models/venue')(mongoose);
require('./models/race')(mongoose);
// /Models

// /Data Access Layer

require('./config/passport')(passport, mongoose); // pass passport for configuration

// var dataMapper = require('./datamappers/pokemon')(mongoose, 'http://pokeapi.co/api/v2');
// dataMapper.mapAllPokemon(function(error)
// {
//     console.log(error);
// }, function()
// {
//     console.log('Mapping of all external Pokemon names done.')
// });
var dataMapper = require('./datamappers/venue')(mongoose, 'https://api.eet.nu');
dataMapper.mapAllVenues(function(error)
{
    console.log(error);
}, function()
{
    console.log('Mapping of all external Venue names done.')
});

var app = express();

var routes = require('./routes/index')(mongoose);
var venues = require('./routes/venue')(mongoose, dataMapper);
var races = require('./routes/race')(mongoose);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/', routes);
app.use('/venues', venues);
app.use('/races', races);

// send error in json.
app.use(function(err, req, res, next)
{
    if(!err){ next(); }
    res.status(err.status || 500);
    
    var response = 
    {
        message: err.message || 'Internal Server Error'
    };
    
    if((err.errors) && (err.errors.length > 0))
    {
        response.errors = err.errors;
    }
    
    console.log(err);
    res.json(response);
});

// catch 404 and send in json.
app.use(function(req, res, next) 
{
    res.status(404);
    res.json({message: 'Not Found'});
});

module.exports = app;

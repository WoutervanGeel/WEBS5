var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var Validate = require('../config/validate');

var Race;

/* REQUEST HANDLER FUNCTIONS */

function getRaces(req, res, next)
{
    // var limit = 20;
    // var offset = 0;
    
    // var query = req.query;
    // var requestIsJSON = false;
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    
    Race.find({}, function(err, races) {
        if(err)
        {
            err = new Error();
            err.status = 500;
            err.message = 'Internal Server Error';
            return next(err);
        }
        
        var results = 
        {
            races: []
        };
        
        _.every(races, function(race)
        {
            results.races.push
            ({
                name: race.name,
                status: race.status,
                venue: race.venue
            });
            return true;
        });
        
        res.status(200);
        if(requestIsJSON){
            res.json(results);
        } else {
            res.render('races', { results: results.races });
        }
    });
};

function getOneRace(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    var name = req.params.name;
    
    Venue.find({}, function(err, venues) {
        var venuelist = [];

        _.every(venues, function(tempvenue)
            {
                venuelist.push({
                    venue: tempvenue,
                    checked: false
                });
                return true;
            });

        Race.findByName(name, function(err, race)
        // Race.findOne(query, function(err, race)
        {
            if(race == null)
            {
                return next();
            }
            if(err)
            { 
                err = new Error();
                err.status = 500;
                err.message = 'Internal Server Error';
                return next(err);
            }

            res.status(200);
            if(requestIsJSON){
                var response = race;
                res.json(response);
            } else {
                var response =
                {
                    venues: venuelist,
                    race: race
                };
                console.log(response.race);
                res.render('singleRace', { response: response });
            }
        });
    });
};

function addRace(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    
    Race.find({},function(err, races) {

        if(races.length < 5){
            console.log(races);
            console.log(races.length);
            var newRace = new Race();
            newRace.name = req.body.name;   
            newRace.status = "not_started";
            newRace.venue = req.body.venue;
            newRace.save(function(error, savedRace)
            {
                if(error){
                    res.status(400);
                    if(requestIsJSON){
                        res.redirect("races");
                    } else {
                        res.redirect("races?format=html");
                    }
                } else {
                    res.status(200);
                    if(requestIsJSON){
                        res.redirect("races");
                    } else {
                        res.redirect("races?format=html");
                    }
                }
            });

        } else {
            res.status(400);
            if(requestIsJSON){
                res.redirect("races");
            } else {
                res.redirect("races?format=html");
            }
        }
    });
};

function postSingleRaceRequest(req, res, next){
    var method = req.body._method;
    if(method == "put"){
        editRace(req, res, next);
    } else if(method == "delete"){
        deleteRace(req, res, next);
    } else {
        res.redirect("races/"+req.params.name+"?format=html");
    }
}

function deleteRace(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    
    Race.remove({ name: req.params.name }, function(err) {
        res.status(200);
        if(requestIsJSON){
            res.send({redirect: '/races'});
        } else {
            res.redirect("/races?format=html");
        }
    });
}

function editRace(req, res, next) {
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    
    Race.findOne({ name: req.params.name }, function (err, race){
        race.name = req.body.name;
        race.status = "not_started";
        console.log("venuename: ",req.body.venue);
        race.venue = req.body.venue;
        
        console.log("saved race ---: ", race);
        
        race.save(function(error, savedRace)
        {
            if(error) console.log("error:",error);
            console.log(savedRace);
        });
    });
    
    res.status(200);
    if(requestIsJSON){
        res.send({redirect: '/races'});
    } else {
        res.redirect("/races?format=html");
    }
};


/* ROUTING */

router.post('/', Validate.admin, addRace);
router.get('/', Validate.user, getRaces);
router.get('/:name', Validate.user, getOneRace);
router.post('/:name', Validate.admin, editRace);
router.put('/:name', Validate.admin, editRace);
router.delete('/:name', Validate.admin, deleteRace);

/* URL VALIDATION */

function isFormatJSON(req){
    var query = req.query;
    if(typeof query.format !== typeof undefined){
        if(query.format == "html"){
            // request is html
            return false;
        } else if(query.format == "json"){
            return true;
        } else {
            var err = new Error();
            err.status = 400;
            err.message = "Bad Request";
            return err;
        }
    } else {
        return true;
    }
}

/* EXPORT FUNCTION */

module.exports = function(mongoose, mapper)
{
    //DataMapper = mapper;
	Race = mongoose.model('Race');
    Venue = mongoose.model('Venue');
	return router;
};
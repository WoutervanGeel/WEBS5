var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var Response = require('../config/responses');
var passport = require('passport');

var Race;

/* REQUEST HANDLER FUNCTIONS */

function getRaces(req, res, next)
{
    Race.find({}).sort({index:'ascending'}).exec(function(err, races)
    {
        var results =
        {
            count: races.count,
            races: []
        };

        if(err)
        {
            Response.setServerError(req,res);
            return next();
        }

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
        if(Response.requestJson(req)){
            res.json(results);
        } else {
            res.render('races', { results: results.races });
        }
    });
}

// todo: fix venues!
function getOneRace(req, res, next)
{
    Race.findOne({ name: req.params.name }, function(err, doc)
    {
        if(doc == null)
        {
            Response.setNotFound(req,res);
            return next();
        }

        if(err)
        {
            Response.setServerError(req,res);
            return next();
        }

        var venue = {};

        if(doc.get('venue') !== undefined){
            venue = doc.get('venue');
        }

        var result =
        {
            name: doc.get('name'),
            status: doc.get('status'),
            venue: venue
        };

        res.status(200);
        if(Response.requestJson(req))
            res.json(result);
        else
           res.render('singleRace', { response: result });

    });
}

function addRace(req, res, next)
{
    if(req.body.name != null) {

        Race.find({}, function (err, races) {
            var racelist = [];

            if(err) {
                Response.setServerError(req,res);
                return next();
            }

            _.every(races, function (race) {
                racelist.push(race);
                return true;
            });

            if (racelist.length < 5) {
                var race = new Race();
                race.name = req.body.name;
                race.status = "not_started";
                race.venue = req.body.venue; // todo: venues verplicht?

                race.save(function (error, savedRace) {

                    if(error) {
                        Response.setServerError(req,res);
                        return next();
                    }

                    var result =
                    {
                        name: savedRace.name,
                        status: savedRace.status
                    };

                    res.status(200);
                    if(Response.requestJson(req))
                        res.json(result);
                    else
                        res.render("singleRace", { response: result });
                });

            }

        });
    }
    else
    {
        Response.setMissingFields(req,res);
    }
}

function deleteRace(req, res, next)
{
    Race.remove({ name: req.params.name }, function(err, obj) {
        if(obj.result.n === 0) {
            Response.setNotFound(req,res);
            return next();
        }
        if(err)
            Response.setServerError(req,res);
        else
            Response.showDeleteSuccess(req,res, req.params.name)
    });
}

function editRace(req, res, next) {

    if(req.body.name != null) {

            Race.findOne({ name: req.params.name }, function (err, race){

                if(race == null)
                {
                    Response.setNotFound(req,res);
                    return next();
                }

                if(err) {
                    Response.setServerError(req, res);
                    return next();
                }

                race.name = req.body.name;
                race.status = race.status;
                race.venue = req.body.venue; // todo: venues verplicht?
                race.save(function (err)
                {
                    if(err) {
                        Response.setServerError(req, res);
                        return next();
                    }
                    else {
                        var result =
                        {
                            name: race.name,
                            status: race.status
                        };

                        res.status(200);
                        if(Response.requestJson(req))
                            res.json(result);
                        else
                            res.render("singleVenue", { response: result });
                    }
                });


            });

    }
    else
    {
        Response.setMissingFields(req,res);
    }

};


/* ROUTING */

router.get('/', passport.authenticate('user', { "session": false }), getRaces);
router.get('/:name', passport.authenticate('user', { "session": false }), getOneRace);
router.post('/', passport.authenticate('admin', { "session": false }), addRace);
router.put('/:name', passport.authenticate('admin', { "session": false }), editRace);
router.delete('/:name', passport.authenticate('admin', { "session": false }), deleteRace);

/* EXPORT FUNCTION */

module.exports = function(mongoose, mapper)
{
    //DataMapper = mapper;
	Race = mongoose.model('Race');
    Venue = mongoose.model('Venue');
	return router;
};
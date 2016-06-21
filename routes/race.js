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
    var query = {};

    /* FILTERS */
    if(req.query.name)
        query.name = new RegExp(req.query.name, 'i');
    if(req.query.status)
        query.status = new RegExp(req.query.status, 'i');
    if(req.query.venue)
        query.venue = new RegExp(req.query.venue, 'i');

    Race.find(query).sort({index:'ascending'}).exec(function(err, races)
    {
        var results =
        {
            count: races.length,
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
            res.render('races', results);
        }
    });
}

function getOneRace(req, res, next)
{
	Race.findByName(req.params.name, function(err, foundRace)
	{
		if(foundRace == null)
        {
            Response.setNotFound(req,res);
            return next();
        }
        
        if(err)
        {
            Response.setServerError(req,res);
            return next();
        }
		
		res.status(200);
		if(Response.requestJson(req))
		{
            res.json(foundRace);
		} else {
			res.render('singleRace', { response: foundRace});
		}
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
        console.log("race",req.params.name);
            Race.findOne({ name: req.params.name }, function (err, race){
                console.log("race:",race);
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
                            status: race.status,
                            venue: race.venue
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
}

function getParticipants(req, res, next) {
    var filter = {};
    var participants = [];
    var name = req.params.name;
    Race.getParticipants(name, function(err, data){
        participants = data.participants;
    
        res.json({
            participants: participants
        });
    });
}

function removeParticipant(req, res, next) {
    var filter = {};
    var participantId = req.params.userId;
    var raceName = req.params.name;
    
    Race.find({name: raceName}, function(err, race) {
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
        
        if(_.contains(race[0].participants, participantId)){
            newParticipantList = _.without(race[0].participants, participantId);
            race[0].participants = newParticipantList;
            race[0].save(function(error, savedRace) {
                if(error){
                    res.status(400);
                    res.json(error);
                } else {
                    res.status(200);
                    res.json(savedRace);
                }
            });
        } else {
            res.status(400);
            res.json('User is not participating in this race.');
        }
    });
}

function getParticipant(req, res, next) {
    var filter = {};
    var name = req.params.name;
    var participantId = req.params.userId;
    Race.find({name: name}, function(err, race){
        if(race == null)
        {
            Response.setNotFound(req,res);
            return next();
        }
        
        if(err)
        {
            Response.setServerError(req,res);
            return next();
        }
        
        if(_.contains(race[0].participants, participantId)){
            participant = _.where(race[0].participants, participantId)[0];
            res.status(200);
            res.json({userId: participant});
        } else {
            Response.setNotFound(req,res);
            return next();
        }
    });
}

function addParticipant(req, res, next) {
    console.log("adding participang");
    var filter = {};
    var newParticipantId = req.body.userId;
    var raceName = req.params.name;
    console.log(req.body.userId);
    console.log(raceName);
    
    Race.findOne({name: raceName}, function(err, race) {
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
        
        if(_.contains(race.participants, newParticipantId)){
            res.status(400);
            res.json('User is already participating in this race.');
            return next(err);
        }

        race.participants.push(newParticipantId);
        race.save(function(error, savedRace) {
            if(error){
                res.status(400);
                res.json(error);
            } else {
                res.status(200);
                res.json(savedRace);
            }
        });
    });
}

/* ROUTING */
router.post('/', passport.authenticate('admin', {"session": false }), addRace);
router.get('/', passport.authenticate('user', {"session": false }), getRaces);
router.get('/:name', passport.authenticate('user', {"session": false }), getOneRace);
router.put('/:name', passport.authenticate('admin', {"session": false }), editRace);
router.delete('/:name', passport.authenticate('admin', {"session": false }), deleteRace);
router.get('/:name/participants', passport.authenticate('user', {"session": false }), getParticipants);
router.post('/:name/participants', passport.authenticate('admin', {"session": false }), addParticipant);
router.get('/:name/participants/:userId', passport.authenticate('user', {"session": false }), getParticipant);
router.delete('/:name/participants/:userId', passport.authenticate('admin', {"session": false }), removeParticipant);

/* EXPORT FUNCTION */

module.exports = function(mongoose, mapper)
{
    //DataMapper = mapper;
	Race = mongoose.model('Race');
    Venue = mongoose.model('Venue');
	return router;
};
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
}

function getParticipants(req, res, next) {
    var filter = {};
    var participants = [];
    var name = req.params.name;
    Race.getParticipants(name, function(err, data){
        console.log("fetched participants");
        participants = data.participants;
    
        res.json({
            filter: filter,
            data: participants
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
            console.log(newParticipantList);
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
    Race.find({name: name}, function(err, data){
        if(_.contains(data[0].participants, participantId)){
            participant = _.where(data[0].participants, participantId)[0];
            res.status(200);
            res.json({
                filter: filter,
                data: participant
            });
        } else {
            res.status(400);
            res.json('User is not participating in this race.');
        }
    });
}

function addParticipant(req, res, next) {
    var filter = {};
    var newParticipantId = req.body.userId;
    var raceName = req.params.name;
    
    Race.find({name: raceName}, function(err, race) {
        if(race[0] == null)
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
        
        if(_.contains(race[0].participants, newParticipantId)){
            res.status(400);
            res.json('User is already participating in this race.');
            return next(err);
        }

        race[0].participants.push(newParticipantId);
        race[0].save(function(error, savedRace) {
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

router.post('/', Validate.admin, addRace);
router.get('/', Validate.user, getRaces);
router.get('/:name', Validate.user, getOneRace);
router.post('/:name', Validate.admin, editRace);
router.put('/:name', Validate.admin, editRace);
router.delete('/:name', Validate.admin, deleteRace);
router.get('/:name/participants', getParticipants);
router.post('/:name/participants', addParticipant);
router.get('/:name/participants/:userId', getParticipant);
router.delete('/:name/participants/:userId', removeParticipant);

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
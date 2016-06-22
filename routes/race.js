var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var Response = require('../config/responses');
var passport = require('passport');

var Race;
var Venue;
var User;

var api_url = 'https://api.eet.nu/venues';

/* REQUEST HANDLER FUNCTIONS */

/* RACES */
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
                venues: race.venues
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
	Race.findOne({ name: req.params.name }, function(err, foundRace)
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

            if(err) {
                Response.setServerError(req,res);
                return next();
            }

            // todo: check if name already exists

            if (races.length < 5) {

                var race = new Race();
                race.name = req.body.name;
                race.status = "not_started";
                race.venues = [];

                race.save(function (error, savedRace) {

                    if(error) {
                        Response.setServerError(req,res);
                        return next();
                    }

                    var result =
                    {
                        name: savedRace.name,
                        status: savedRace.status,
                        venues: savedRace.venues
                    };

                    res.status(200);
                    if(Response.requestJson(req))
                        res.json(result);
                    else
                        res.render("singleRace", { response: result });
                });

            } else {
                Response.setTooManyRaces(req,res);
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

    if(req.body.name != null || req.body.status != null) {
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

                if(req.body.name) {
                    race.name = req.body.name;
                }
                if(req.body.status == "started") {
                    race.status = req.body.status;
                }

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

/* VENUES */

function getVenues(req, res, next) {
    var race = req.params.name;

    Race.findOne({ name: race }, function(err, doc)
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

        res.status(200);
        if(Response.requestJson(req))
        {
            res.json(doc.venues);
        } else {
            res.render('arrayList', { arr: doc.venues}); // todo: custom layout
        }
    });
}

function addVenue(req, res, next)
{
    var race = req.params.name;
    var venueId = req.body.id;
    if(venueId != null) {
        Race.findOne({name: race}, function (err, doc) {
            if (doc == null) {
                Response.setNotFound(req, res);
                return next();
            }

            if (err) {
                Response.setServerError(req, res);
                return next();
            }

            if (doc.venues.indexOf(venueId) > -1) {
                return next();
                // todo: error already in list
            }

            Venue.findOne({id: venueId}, function (err, venue) {
                if (venue == null) {

                    request(api_url + "/" + venueId, function (error, response, body) {
                        console.log(venueId);
                        if (error) {
                            Response.setServerError(req, res);
                            return next();
                        }

                        var jsonObj = JSON.parse(body);

                        if (!jsonObj.id) {
                            Response.setNotFound(req, res);
                            return next();
                        }

                        doc.venues.push(venueId);
                        doc.save();

                        res.status(200);
                        if (Response.requestJson(req)) {
                            res.json(doc.venues);
                        } else {
                            res.render('arrayList', {arr: doc.venues}); // todo: custom layout
                        }
                    });
                }
                else {
                    if (err) {
                        Response.setServerError(req, res);
                        return next();
                    }
                    doc.venues.push(venueId);
                    doc.save();

                    res.status(200);
                    if (Response.requestJson(req)) {
                        res.json(doc.venues);
                    } else {
                        res.render('arrayList', {arr: doc.venues}); // todo: custom layout
                    }
                }
            });
        });
    }
    else
    {
        Response.setMissingFields(req,res);
    }

}

function removeVenue(req, res, next)
{
    var race = req.params.name;
    var venueId = req.params.id;

    Race.findOne({name: race}, function (err, doc) {
        if (doc == null) {
            Response.setNotFound(req, res); // todo: race not found
            return next();
        }

        if (err) {
            Response.setServerError(req, res);
            return next();
        }

        var index = doc.venues.indexOf(venueId);

        if (index > -1) {
            doc.venues.splice(index, 1);
            doc.save();
            Response.showDeleteSuccess(req,res, venueId);
        }
        else {
            Response.setNotFound(req, res);
            return next();
        }
    });

}

/* PARTICIPANTS */

function getParticipants(req, res, next) {
    var name = req.params.name;

    Race.findOne({name: name}, function(err, race) {

        if (race == null) {
            Response.setNotFound(req, res); // todo: race not found
            return next();
        }

        if (err) {
            Response.setServerError(req, res);
            return next();
        }

        var userIds = [];
        _.each(race.participants, function(result)
        {
            userIds.push(result.id);
        });

        User.findOne({'_id': { $in: userIds}}, function(err, users) {

            if (race == null) {
                Response.setNotFound(req, res); // todo: race not found
                return next();
            }

            if (err) {
                Response.setServerError(req, res);
                return next();
            }

            var result = [];
            _.each(users, function(user)
            {
                result.push({
                    id: user._id,
                    name: user.name
                });
            });

            res.status(200);
            res.json(result);
        });
    });
}

function removeParticipant(req, res, next) {
    var name = req.params.name;
    var participantId = req.params.userId;

    Race.findOne({name: name}, function(err, race){

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

        var participant;
        _.each(race.participants, function(result)
        {
            if(result.id == participantId)
            {
                participant = result;
            }
        });

        if(!participant) {
            Response.setNotFound(req, res);
            return next();
        }
        else {
            participant.remove();
            race.save();

            Response.showDeleteSuccess(req,res, participantId)
        }
    });
}

function editParticipant(req, res, next) {
    var name = req.params.name;
    var participantId = req.params.userId;
    //noinspection JSUnresolvedVariable
    var venueId = req.body.venueId;

    Race.findOne({name: name}, function(err, race){
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

        if(race.status == "ended")
        {
            // todo: correct error
            Response.setNotFound(req,res);
            return next();
        }

        if(race.status == "not_started")
        {
            // todo: correct error
            Response.setNotFound(req,res);
            return next();
        }

        var participant;
        _.each(race.participants, function(result)
        {
            if(result.id == participantId)
            {
                participant = result;
            }
        });

        if (participant) {
            var index = participant.venues.indexOf(venueId);
            if (index == -1) {

                var venueIndex = race.venues.indexOf(venueId);
                if (venueIndex == -1) {
                    // todo: error venue not in Race
                    Response.setNotFound(req, res);
                    return next();
                }

                participant.venues.push(venueId);

                // check winner
                if (race.venues.length == participant.venues.length) {
                    participant.winner = true;
                    race.status = "ended";
                }

                race.save();

                // todo: correct response
                res.status(200);
                res.json(participant);
            }
        } else {
            Response.setNotFound(req, res);
            return next();
        }
    });
}

function getParticipant(req, res, next) {
    var name = req.params.name;
    var participantId = req.params.userId;

    Race.findOne({name: name}, function(err, race){

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

        var participant;
        _.each(race.participants, function(result)
        {
            if(result.id == participantId)
            {
                participant = result;
            }
        });

        if(!participant) {
            Response.setNotFound(req, res);
            return next();
        }
        else {
            res.status(200);
            res.json(participant); // todo: uniform result
        }
    });
}

function addParticipant(req, res, next) {

    var newParticipantId = req.body.userId;
    var raceName = req.params.name;
    
    Race.findOne({name: raceName}, function(err, race) {

        if (race == null) {
            Response.setNotFound(req, res);  // todo: race not found
            return next();
        }

        if (err) {
            Response.setServerError(req, res);
            return next();
        }

        if(_.contains(race.participants, newParticipantId)){
            res.status(400);
            res.json('User is already participating in this race.');
            return next(err); // todo: uniform format
        }

        race.participants.push({
            id: newParticipantId,
            venues: []
        });

        race.save(function(error, savedRace) {
            if (error) {
                Response.setServerError(req, res);
                return next();
            } else {
                res.status(200);
                res.json(savedRace); // todo: show user
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

router.get('/:name/venues', passport.authenticate('user', {"session": false }), getVenues);
router.post('/:name/venues', passport.authenticate('admin', {"session": false }), addVenue);
router.delete('/:name/venues/:id', passport.authenticate('admin', {"session": false }), removeVenue);

router.get('/:name/participants', passport.authenticate('user', {"session": false }), getParticipants);
router.post('/:name/participants', passport.authenticate('admin', {"session": false }), addParticipant);
router.get('/:name/participants/:userId', passport.authenticate('user', {"session": false }), getParticipant);
router.put('/:name/participants/:userId', passport.authenticate('user', {"session": false }), editParticipant);
router.delete('/:name/participants/:userId', passport.authenticate('admin', {"session": false }), removeParticipant);

/* EXPORT FUNCTION */

module.exports = function(mongoose)
{
	Race = mongoose.model('Race');
    Venue = mongoose.model('Venue');
    User = mongoose.model('User');
	return router;
};
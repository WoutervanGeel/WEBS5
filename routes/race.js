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

    Race.find({}).sort({index:'ascending'}).exec(function(err, docs)
    {
        var results =
        {
            count: docs.count,
            results: []
        };

        if(err)
        {
            Response.setServerError(req,res);
            return next();
        }

        _.every(docs, function(doc)
        {
            results.results.push
            ({
                name: doc.name
            });
            return true;
        });
        
        res.status(200);
        if(Response.requestJson(req)){
            res.json(results);
        } else {
            res.render('races', { results: results.results });
        }
        
    });
};

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

        var venues = [];
        if(typeof doc.get('venue') !== undefined){
            venues = doc.get('venue');
        }
        var result =
        {
            name: doc.get('name'),
            status: doc.get('status'),
            venues: venues
        };

        res.status(200);
        if(Response.requestJson(req))
            res.json(result);
        else
           res.render('singleRace', { response: result });
    });
};

function addRace(req, res, next)
{

    Race.find({}, function(err, races) {
    var racelist = [];

    _.every(races, function(race)
        {
            racelist.push(race);
            return true;
        });

    if(racelist.length < 5){
        //var venue = {};
        var race = new Race();
        race.name = req.body.name;   
        race.status = "not_started";
        //race.venue = venue;
        race.save(function(error, savedRace)
        {
            if(error) console.log(error);
        });
 
    }
    res.status(200);
    if(Response.requestJson(req)){
        res.redirect("races");
    } else {
        res.redirect("races?format=html");
    }
    

  });
};

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

    if( typeof req.body.venue == 'object'){
        var query = 
        {
            name: req.body.venue.name
        }
    } else {
        var query = 
        {
            name: req.body.venue
            //name: "Yusuffa"
        }
    }

    //
    Venue.findOne(query, function(err, selectedVenue)
    {
        // var response =
        // {
        //     name: selectedVenue.get('name'),
        //     category: selectedVenue.get('category')
        // };

        var query = { name: req.params.name , status: req.body.racestatus};
        var racestatus = req.body.racestatus;
        
        //var options = { multi: false };
        Race.findOne({ name: req.params.name }, function (err, race){
            race.name = req.body.name;
            race.status = "not_started";
            if(typeof selectedVenue !== undefined){
                race.venue = selectedVenue;
            }
            //doc.visits.$inc();
            race.save(function (err)
            {
                console.log('save err', err);
            });
        });
    });
    //

    res.status(200);
    if(Response.requestJson(req)){
        res.send({redirect: '/races'});
    } else {
        res.redirect("/races?format=html");
    }
};


/* ROUTING */

router.get('/', passport.authenticate('user', { "session": false }), getRaces);
router.get('/:name', passport.authenticate('user', { "session": false }), getOneRace); // todo
router.post('/', passport.authenticate('admin', { "session": false }), addRace); // todo
router.put('/:name', passport.authenticate('admin', { "session": false }), editRace); // todo
router.delete('/:name', passport.authenticate('admin', { "session": false }), deleteRace);

/* EXPORT FUNCTION */

module.exports = function(mongoose, mapper)
{
    //DataMapper = mapper;
	Race = mongoose.model('Race');
    Venue = mongoose.model('Venue');
	return router;
};
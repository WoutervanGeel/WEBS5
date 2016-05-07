var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');

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
    
    Race.find({}).sort({index:'ascending'}).exec(function(err, docs)
    {
        if(err)
        {
            err = new Error();
            err.status = 500;
            err.message = 'Internal Server Error';
            return next(err);
        }
        
        var results = 
        {
            count: 0,
            results: []
        };
        
        _.every(docs, function(doc)
        {
            results.results.push
            ({
                name: doc.name
            });
            return true;
        });
        
        res.status(200);
        if(requestIsJSON){
            res.json(results);
        } else {
            res.render('races', { results: results.results });
        }
        
    });
};

function getOneRace(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    var query = 
    {
        name: req.params.name
    }
    /////////////////////////////////////////////////////////////////////////////////////////
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

        Race.findOne(query, function(err, race)
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
            
            var racevenue = {};
            if(typeof race.get('venue') !== undefined){
                racevenue = race.get('venue');
            }

            res.status(200);
            if(requestIsJSON){
                var response =
                {
                    name: race.get('name'),
                    status: race.get('status'),
                    venue: racevenue
                };
                
                res.json(response);
            } else {
                var response =
                {
                    venues: venuelist,
                    race: {
                        name: race.get('name'),
                        status: race.get('status'),
                        venue: racevenue
                    }
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
    if(requestIsJSON){
        res.redirect("races");
    } else {
        res.redirect("races?format=html");
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
            res.redirect("/races");
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
    if(requestIsJSON){
        res.redirect("/races");
    } else {
        res.redirect("/races?format=html");
    }
};


/* ROUTING */

router.post('/', addRace);
router.get('/', getRaces);
router.get('/:name', getOneRace);
router.post('/:name', postSingleRaceRequest);
router.put('/:name', editRace);
router.delete('/:name', deleteRace);

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
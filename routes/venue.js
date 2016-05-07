var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');

var Venue;
var DataMapper;

/* REQUEST HANDLER FUNCTIONS */

function getVenues(req, res, next)
{
    // var limit = 20;
    // var offset = 0;
    
    // var query = req.query;
    // var requestIsJSON = false;
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    
    //If both offset and limit parameters are set.
    // if((typeof query.limit !== typeof undefined)&&(typeof query.offset !== typeof undefined))
    // {
    //     var errors = checkUrlQueryValues(query);
    //     if(errors.length != 0)
    //     {
    //         err = new Error();
    //         err.status = 400;
    //         err.message = 'Bad Request';
    //         err.errors = errors;
    //         return next(err);
    //     }
    //     else
    //     {
    //         limit = query.limit;
    //         offset = query.offset;
    //     }
    // }
    
    Venue.find({}).sort({index:'ascending'}).exec(function(err, docs)
    {
        var count = 0;
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
        
        // _.every(docs, function(doc)
        // {
        //     if(results.count < limit)
        //     {
        //         if(index > offset)
        //         {
        //             results.results.push
        //             ({
        //                 name: doc.name
        //             });
        //             results.count++;
        //         }
        //     }
        //     else return false;

        //     index++;
        //     return true;
        // });
        
        _.every(docs, function(doc)
        {
            count++;
            results.count = count;
            results.results.push
            ({
                name: doc.name,
                category: doc.category
            });
            return true;
        });
        
        res.status(200);
        if(requestIsJSON){
            res.json(results);
        } else {
            res.render('venues', { results: results.results });
        }
        
    });
};

function getOneVenue(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    var query = 
    {
        name: req.params.name
    }
    Venue.findOne(query, function(err, doc)
    {
        if(doc == null)
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
        if(!doc.isMapped)
        {
            DataMapper.mapVenue(doc, function(error)
            {
                error.status = 500;
                next(error);
            }, function(response)
            {
                res.status(200);
                //res.json(response);
                if(requestIsJSON){
                    res.json("response: "+response);
                } else {
                    res.render('singleVenue', { response: response });
                }
            });
        }
        else
        {
            var response =
            {
                name: doc.get('name'),
                category: doc.get('category')
            };
            res.status(200);
            if(requestIsJSON){
                res.json(response);
            } else {
                res.render('singleVenue', { response: response });
            }
        }
    });
};

function addVenue(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }

    var venue = new Venue();
    venue.name = req.body.name;    
    venue.category = req.body.category;
    venue.isMapped = true;
    venue.save(function(error, savedVenue)
    {
        if(error) console.log(error);
    });
    
    res.status(200);
    if(requestIsJSON){
        res.redirect("venues");
    } else {
        res.redirect("venues?format=html");
    }
};

function postSingleVenueRequest(req, res, next){
    var method = req.body._method;
    if(method == "put"){
        editVenue(req, res, next);
    } else if(method == "delete"){
        deleteVenue(req, res, next);
    } else {
        res.redirect("venues/"+req.params.name+"?format=html");
    }
}

function deleteVenue(req, res, next)
{
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    
    Venue.remove({ name: req.params.name }, function(err) {
        res.status(200);
        if(requestIsJSON){
            res.redirect("/venues");
        } else {
            res.redirect("/venues?format=html");
        }
    });
}

function editVenue(req, res, next) {
    var requestIsJSON = isFormatJSON(req);
    if(requestIsJSON instanceof Error){
        return next(requestIsJSON);
    }
    console.log("PUTTING edit Venue");
    
    
    var query = { name: req.params.name , category: req.body.category};
    var category = req.body.category;
    //var options = { multi: false };
    Venue.findOne({ name: req.params.name }, function (err, doc){
        doc.name = req.body.name;
        doc.category = req.body.category;
        //doc.visits.$inc();
        doc.save();
    });
    
    res.status(200);
    if(requestIsJSON){
        res.redirect("/venues");
    } else {
        res.redirect("/venues?format=html");
    }
};


/* ROUTING */

router.post('/', addVenue);
router.get('/', getVenues);
router.get('/:name', getOneVenue);
router.post('/:name', postSingleVenueRequest);
router.put('/:name', editVenue);
router.delete('/:name', deleteVenue);

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
    DataMapper = mapper;
	Venue = mongoose.model('Venue');
	return router;
};
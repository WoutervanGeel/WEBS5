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
    
    var query = req.query;
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
        
        var index = 1;
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
            results.results.push
            ({
                name: doc.name
            });
            index++;
            return true;
        });
        
        res.status(200);
        res.json(results);
    });
};

function getOneVenue(req, res, next)
{
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
                console.log('Mapping of Venue data for: ' + doc.name + ' has been done.')
                res.status(200);
                res.json(response);
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
            res.json(response);
        }
    });
};

/* ROUTING */

router.get('/', getVenues);
router.get('/:name', getOneVenue);

/* URL VALIDATION */

// function checkUrlQueryValues(query)
// {
//     var errors = [];
//     limit = parseInt(query.limit);
//     offset = parseInt(query.offset);
    
//     //Validate parameter values.
//     if((isNaN(limit))||(limit < 1))
//     {
//         errors.push("Limit parameter must be a positive number.");
//     }
    
//     if((isNaN(offset))||(offset < 0))
//     {
//         errors.push("Offset parameter must be a positive number or zero.");
//     }
//     return errors;
// }

/* EXPORT FUNCTION */

module.exports = function(mongoose, mapper)
{
    DataMapper = mapper;
	Venue = mongoose.model('Venue');
	return router;
};
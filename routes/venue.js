var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');
var _ = require('underscore');
var Response = require('../config/responses');
var passport = require('passport');
var mongoose = require('mongoose');

var Venue;

var api_url = 'https://api.eet.nu/venues';

/* REQUEST HANDLER FUNCTIONS */
function getAll(req, res, next) {

    var limit = 10;
    var page = 0;
    var query = {};

    /* FILTERS */
    if(req.query.name)
        query.name = new RegExp(req.query.name, 'i');
    if(req.query.category)
        query.category = new RegExp(req.query.category, 'i');

    if(req.query.page)
    {
        var q_page = parseInt(req.query.page);
        if(q_page > 0)
            page = q_page;
    }
    if(req.query.limit)
    {
        var q_limit = parseInt(req.query.limit);
        if(q_limit > 0)
            limit = q_limit;
    }

    var combinedVenues = [];
    async.parallel
    ([
        function(callback)
        {
            var url = api_url;
            if(req.query.name)
                url += '?query='+req.query.name;
            request(url, function(error, response, body)
            {
                if(error)
                    return callback(error);

                var externalVenues = JSON.parse(body);

                _.each(externalVenues.results, function(result)
                {
                    var venue = {};
                    venue.id = ""+result.id;
                    venue.name = result.name;
                    venue.category = result.category;
                    venue.local = false;

                    if(!(venue.id in combinedVenues))
                        combinedVenues[venue.id] = venue;
                });
                return callback();
            });
        },
        function(callback)
        {
            Venue.find(query).sort({index:'ascending'}).exec(function(err, docs)
            {
                if(err)
                {
                    Response.setServerError(req,res);
                    return next();
                }

                _.every(docs, function(doc)
                {
                    combinedVenues[doc.id] = {
                        id: doc.id,
                        name: doc.name,
                        category: doc.category,
                        local: true
                    };
                    return true;
                });

                return callback();
            });

        }
    ], function(error) {

        if(error)
        {
            Response.setServerError(req,res);
            return next();
        }

        // omzetten naar object
        var venuesResult = [];
        for (var k in combinedVenues) {
            if (combinedVenues.hasOwnProperty(k)) {
                if(!req.query.category || combinedVenues[k].category.toLowerCase().indexOf(req.query.category.toLowerCase()) > -1) {
                    venuesResult.push({
                        id: combinedVenues[k].id,
                        name: combinedVenues[k].name,
                        category: combinedVenues[k].category
                    });
                }
            }
        }

        // sort & limit
        _.sortBy(venuesResult, function(o) { return o.name; });
        venuesResult = venuesResult.slice(page*limit, (page*limit)+limit);

        var results =
        {
            limit: limit,
            page: page,
            count: venuesResult.length,
            results: venuesResult
        };

        res.status(200);
        if(Response.requestJson(req)){
            res.json(results);
        } else {
            res.render('venues', results);
        }
    });
}

function getVenue(req, res, next)
{
    Venue.findOne({ id: req.params.id }, function(err, doc)
    {
        if(doc == null)
        {
            request(api_url+"/"+req.params.id, function(error, response, body)
            {
                if(error) {
                    Response.setServerError(req, res);
                    return next();
                }

                var jsonObj = JSON.parse(body);

                if(!jsonObj.id)
                {
                    Response.setNotFound(req,res);
                    return next();
                }

                var result =
                {
                    id: jsonObj.id,
                    name: jsonObj.name,
                    category: jsonObj.category,
                    local: false
                };

                res.status(200);
                if (Response.requestJson(req))
                    res.json(result);
                else
                    res.render("singleVenue", {response: result});
            });
        }
        else {
            if (err) {
                Response.setServerError(req, res);
                return next();
            }

                var result =
                {
                    id: doc.get('id'),
                    name: doc.get('name'),
                    category: doc.get('category'),
                    local: true
                };

                res.status(200);
                if (Response.requestJson(req))
                    res.json(result);
                else
                    res.render("singleVenue", {response: result});
        }
    });
}

function addVenue(req, res, next)
{
    if(req.body.name != null && req.body.category != null)
    {
        var venue = new Venue();
        venue.name = req.body.name;
        venue.category = req.body.category;
        venue.id = new mongoose.mongo.ObjectID();
        venue.save(function(error, savedVenue)
        {
            if(error) {
                Response.setServerError(req,res);
                return next();
            }

            var result =
            {
                id : savedVenue.id,
                name: savedVenue.name,
                category: savedVenue.category
            };

            res.status(200);
            if(Response.requestJson(req))
                res.json(result);
            else
                res.render("singleVenue", { response: result });
        });
    }
    else
    {
        Response.setMissingFields(req,res);
    }
}

function deleteVenue(req, res, next)
{
    Venue.findOne({ id: req.params.id }, function (err, doc){

        if(doc == null)
        {
            Response.setNotFoundOnLocal(req,res);
            return next();
        }

        if(err)
        {
            Response.setServerError(req,res);
            return next();
        }

        doc.remove();

        Response.showDeleteSuccess(req,res, doc.name)
    });
}

function editVenue(req, res, next) {

    if(req.body.name != null && req.body.category != null)
    {
        Venue.findOne({ id: req.params.id }, function(err, doc)
        {
            if(doc == null)
            {
                request(api_url+"/"+req.params.id, function(error, response, body)
                {
                    if(error) {
                        Response.setServerError(req, res);
                        return next();
                    }

                    var jsonObj = JSON.parse(body);

                    if(!jsonObj.id)
                    {
                        Response.setNotFound(req,res);
                        return next();
                    }

                    var venue = new Venue();
                    venue.name = req.body.name;
                    venue.category = req.body.category;
                    venue.id = req.params.id;
                    venue.local = true;
                    venue.save(function(error, savedVenue)
                    {
                        if(error) {
                            Response.setServerError(req,res);
                            return next();
                        }

                        var result =
                        {
                            id : savedVenue.id,
                            name: savedVenue.name,
                            category: savedVenue.category,
                            local: true
                        };

                        res.status(200);
                        if(Response.requestJson(req))
                            res.json(result);
                        else
                            res.render("singleVenue", { response: result });
                    });

                });
            }
            else {
                if (err) {
                    Response.setServerError(req, res);
                    return next();
                }

                doc.name = req.body.name;
                doc.category = req.body.category;
                doc.save();

                var result =
                {
                    id: doc.id,
                    name: doc.name,
                    category: doc.category,
                    local: true
                };

                res.status(200);
                if (Response.requestJson(req))
                    res.json(result);
                else
                    res.render("singleVenue", {response: result});
            }
        });
      
    }
    else
    {
        Response.setMissingFields(req,res);
    }

}

/* ROUTING */
router.get('/', passport.authenticate('user', { "session": false }), getAll);
router.get('/:id', passport.authenticate('user', { "session": false }), getVenue);
router.post('/', passport.authenticate('admin', { "session": false }), addVenue);
router.put('/:id', passport.authenticate('admin', { "session": false }), editVenue); //todo
router.delete('/:id', passport.authenticate('admin', { "session": false }), deleteVenue);

/* EXPORT FUNCTION */
module.exports = function(mongoose)
{
	Venue = mongoose.model('Venue');
	return router;
};
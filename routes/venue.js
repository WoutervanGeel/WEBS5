var express = require('express');
var router = express.Router();
var request = require('request');
var _ = require('underscore');
var Response = require('../config/responses');
var passport = require('passport');

var Venue;
var DataMapper;

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

    Venue.find(query).limit(limit).skip(limit * page).sort({index:'ascending'}).exec(function(err, docs)
    {
        var results =
        {
            limit: limit,
            page: page,
            count: docs.length,
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
                name: doc.name,
                category: doc.category
            });
            return true;
        });

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
    Venue.findOne({ name: req.params.name }, function(err, doc)
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

        if(!doc.isMapped)
        {
            DataMapper.mapVenue(doc,
                function() {
                    Response.setServerError(req,res);
                    return next();
                },
                function(result) {
                    res.status(200);
                    if (Response.requestJson(req))
                        res.json(result);
                    else
                        res.render("singleVenue", {response: result });
                });
        }
        else
        {
            var result =
            {
                name: doc.get('name'),
                category: doc.get('category')
            };

            res.status(200);
            if(Response.requestJson(req))
                res.json(result);
            else
                res.render("singleVenue", { response: result });
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
        venue.isMapped = true;
        venue.save(function(error, savedVenue)
        {
            if(error) {
                Response.setServerError(req,res);
                return next();
            }

            var result =
            {
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
    Venue.remove({ name: req.params.name }, function(err, obj) {
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

function editVenue(req, res, next) {

    if(req.body.name != null && req.body.category != null)
    {
        Venue.findOne({ name: req.params.name }, function (err, doc){

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

            doc.name = req.body.name;
            doc.category = req.body.category;
            doc.save();

            var result =
            {
                name: doc.name,
                category: doc.category
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

/* ROUTING */
router.get('/', passport.authenticate('user', { "session": false }), getAll);
router.get('/:name', passport.authenticate('user', { "session": false }), getVenue);
router.post('/', passport.authenticate('admin', { "session": false }), addVenue);
router.put('/:name', passport.authenticate('admin', { "session": false }), editVenue);
router.delete('/:name', passport.authenticate('admin', { "session": false }), deleteVenue);

/* EXPORT FUNCTION */
module.exports = function(mongoose, mapper)
{
    DataMapper = mapper;
	Venue = mongoose.model('Venue');
	return router;
};
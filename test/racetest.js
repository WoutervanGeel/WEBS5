var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('underscore');
var async = require('async');

var mongoose = require('mongoose');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

require('../models/race')(mongoose);
var Race = mongoose.model('Race');

var app = require('express')();
var raceRoute = require('../routes/races')(mongoose);
app.use('/races', raceRoute);

function makeRequest(route, statusCode, done)
{
	request(app).get(route).expect(statusCode).end(function(err, res)
    {
        if(err)
        { 
            return done(err);
        }

        done(null, res);
    });
};

before(function(done)
{
    this.timeout(30000);
    mongoose.connect(''); //Does not matter what we connect to mockgoose intercepts the call.
});

describe('Testing /races route', function()
{
    describe('Testing /races GET.', function()
    {
        it('should return a list of races. HTTP CODE = 200', function(done)
        {
            var databaseRaces;
            async.series
            ([
                function(callback)
                {
                    async.parallel
                    ([
                        
                    ], function(error)
                    {
                        if(error) done(error);
                        else done();
                    });
                    testRace1 = new Race();
                    testRace1.name = "testRace1";
                    testRace1.status = "not_started";
                    testRace1.save(function (error, doc) 
                    {
                        if(error) return callback(error);
                        callback();
                    });
                },
                function(callback)
                {
                    Race.find({}, function(error, doc)
                    {
                        if (error) return callback(error);
                        databaseRaces = doc;
                        callback();
                    });
                },
                function(callback)
                {
                    var expectedCount = 100;
                    
                    makeRequest('/races', 200, function(err, res)
                    {
                        if(err) return callback(err);
                        
                        expect(res.body).to.have.property('results');
                        expect(res.body.results).to.be.an('array');
                        
                        var actualCounted = 0;
                        _.each(res.body.results, function(result)
                        {
                            expect(result).to.have.property('name');
                            expect(result.name).to.be.an('string');
                            expect(result.name).to.equal(databaseVenues[actualCounted].name);
                            actualCounted++;
                        });
                        
                        expect(actualCounted).to.equal(expectedCount);
                        expect(res.body.count).to.equal(expectedCount);
                        
                        callback();
                    });
                }
            ], function(error)
            {
                if(error) done(error);
                else done();
            });
        });
    });
    describe('Testing /races with negative results.', function()
    {
        it('should return HTTP 400 if format is not "html" or "json".', function(done)
        {
            makeRequest('/races?format=a', 400, function(err, res)
            {
                if(err) return done(err);
                done();
            });
        });
    });
});

describe('Testing /races/:name route', function()
{
    var testVenueData =
    {
        "name": "testVenueName",
        "category": "testVenueCategory"
    }
    var testVenue = new Venue(testVenueData);
    var testRaceData =
    {
        "name": 'testRace',
        "category": "testCategory",
        "venue": testVenueData
    };
    
    var testRace = new Race(testRaceData);
    before(function(done)
    {
        testVenue.save(function(err, savedVenue)
        {
            if(err) return done(err);
            done();
        });
        
        testRace.save(function(err, savedRace)
        {
            if(err) return done(err);
            done();
        });
    });
    describe('Testing /races/:name with positive results.', function()
    {
        it('should return Race data.', function(done)
        {
            makeRequest('/races/testRace', 200, function(err, res)
            {
                if(err) return done(err);
                
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('status');
                expect(res.body).to.have.property('venue');
                
                expect(res.body.name).to.equal(testRace.name);
                expect(res.body.status).to.equal(testRace.category);
                expect(res.body.venue).to.equal(testRace.venue);
                
                done();
            });
        });
    });
    describe('Testing /races/:name with negative results.', function()
    {
       it('should return HTTP 404 when no name matches a Race in the database.', function(done)
       {
           makeRequest('/races/nonexistingrace', 404, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    after(function(done)
    {
        testRace.remove(function(err, removedRace)
        {
            if(err) return done(err);
            done();
        });
    });
});

after(function(done)
{
    mongoose.unmock(function()
    {
        done();
    });
});
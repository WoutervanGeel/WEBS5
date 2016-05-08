var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('underscore');
var async = require('async');

var mongoose = require('mongoose');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

require('../models/venue')(mongoose);
var Venue = mongoose.model('Venue');

var dataMapper = require('../datamappers/venues')(mongoose);

var app = require('express')();
var venueRoute = require('../routes/venues')(mongoose, dataMapper);
app.use('/venues', venueRoute);

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
    dataMapper.mapAllVenues(function(error)
    {
        done(error);
    }, function()
    {
        done();
    });
});

describe('Testing /venues route', function()
{
    describe('Testing /venues with positive results.', function()
    {
        it('should return a list of venues. HTTP CODE = 200', function(done)
        {
            var databaseVenues;
            async.series
            ([
                function(callback)
                {
                    Venue.find({}, function(error, doc)
                    {
                        if (error) return callback(error);
                        databaseVenues = doc;
                        callback();
                    });
                },
                function(callback)
                {
                    var expectedCount = 100;
                    
                    makeRequest('/venues', 200, function(err, res)
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
        // it('should return a list of 60 pokemon starting from the 21st index. HTTP CODE = 200', function(done)
        // {
        //     var databaseVenues;
        //     async.series
        //     ([
        //         function(callback)
        //         {
        //             Pokemon.find({}, function(error, doc)
        //             {
        //                 if(error) return callback(error);
        //                 databaseVenues = doc;
        //                 callback();
        //             });
        //         }, function(callback)
        //         {
        //             var expectedCount = 60;
                    
        //             makeRequest('/pokemon?limit=60&offset=20', 200, function(err, res)
        //             {
        //                 if(err) return callback(err);
                        
        //                 expect(res.body).to.have.property('count').and.not.be.undefined;
        //                 expect(res.body).to.have.property('results').and.not.be.undefined;
        //                 expect(res.body.results).to.be.an('array');
                        
        //                 var arrayIndex = 20; //Used as index for the databasePokemon array.
        //                 var actualCounted = 0;
        //                 _.each(res.body.results, function(result)
        //                 {
        //                     expect(result).to.have.property('name').and.not.be.undefined;
        //                     expect(result.name).to.be.an('string');
        //                     expect(result.name).to.equal(databaseVenues[arrayIndex].name);
        //                     actualCounted++;
        //                     arrayIndex++;
        //                 });
                        
        //                 expect(actualCounted).to.equal(expectedCount);
        //                 expect(res.body.count).to.equal(expectedCount);
                        
        //                 callback();
        //             });
        //         }
        //     ], function(error)
        //     {
        //         if(error) done(error);
        //         else done();
        //     });
        // });
    });
    describe('Testing /venues with negative results.', function()
    {
        it('should return HTTP 400 if format is not "html" or "json".', function(done)
        {
            makeRequest('/venues?format=a', 400, function(err, res)
            {
                if(err) return done(err);
                done();
            });
        });
    });
});

describe('Testing /venues/:name route', function()
{
    var testData =
    {
        externalUrl: '',
        name: 'testVenue',
        category: "testCategory"
    };
    var testVenue = new Venue(testData);
    before(function(done)
    {
        testVenue.save(function(err, savedVenue)
        {
            if(err) return done(err);
            done();
        });
    });
    describe('Testing /venues/:name with positive results.', function()
    {
        it('should return Venue data.', function(done)
        {
            makeRequest('/venues/testVenue', 200, function(err, res)
            {
                if(err) return done(err);
                
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('category');
                
                expect(res.body.name).to.equal(testData.name);
                expect(res.body.category).to.equal(testData.category);
                
                done();
            });
        });
    });
    describe('Testing /venues/:name with negative results.', function()
    {
       it('should return HTTP 404 when no name matches a Venue in the database.', function(done)
       {
           makeRequest('/venues/nonexistingvenue', 404, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    after(function(done)
    {
        testVenue.remove(function(err, removedVenue)
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
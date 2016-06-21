var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var _ = require('underscore');
var async = require('async');

var mongoose = require('mongoose');
require('../routes/race.js');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

require('../models/race')(mongoose);
var Race = mongoose.model('Race');

var app = require('express')();
var raceRoute = require('../routes/races')(mongoose);

app.use('/races', raceRoute);

var adminUserData = {
    name: "admin",
    group: "admin",
    local: {
        email: "admin@administrator.nl",
        password: "admin"
    }
}
var adminUser = new User(adminUserData);
var bAuth;

//xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
function makeGetRequest(route, statusCode, done)
{
	request(app).set("Authorization", "Basic " + bAuth).get(route).expect(statusCode).end(function(err, res)
    {
        if(err)
        { 
            return done(err);
        }

        done(null, res);
    });
};

function makePutRequest(route, data, statusCode, done)
{
	request(app).put(route).send(data).expect(statusCode).end(function(err, res)
    {
        if(err)
        { 
            return done(err);
        }

        done(null, res);
    });
};

function makePostRequest(route, data, statusCode, done)
{
	request(app).post(route).send(data).expect(statusCode).end(function(err, res)
    {
        if(err)
        { 
            return done(err);
        }

        done(null, res);
    });
};

function makeDeleteRequest(route, statusCode, done)
{
	request(app).delete(route).expect(statusCode).end(function(err, res)
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
    before(function(done)
    {        
        adminUser.save(function(err, user)
        {
            if(err) return done(err);
            bAuth = btoa(adminUserData.local.email + ":" + adminUserData.local.password);
            done();
        });
    });
    describe('Testing /races GET.', function()
    {
        it('should return a list of races. HTTP CODE = 200', function(done)
        {
            var databaseRaces;
            async.series
            ([
                function(callback)
                {
                    //adding races
                    async.parallel
                    ([
                        function(callback){
                            console.log("adding first");
                            var tempRace = new Race();
                            tempRace.name = "testRace1";
                            tempRace.status = "not_started";
                            tempRace.save(function (error, doc) 
                            {
                                if(error) return callback(error);
                                callback();
                            });
                        },
                        function(callback){
                            console.log("adding second");
                            var tempRace = new Race();
                            tempRace.name = "testRace2";
                            tempRace.status = "not_started";
                            tempRace.save(function (error, doc) 
                            {
                                if(error) return callback(error);
                                callback();
                            });
                        },
                        function(callback){
                            console.log("adding third");
                            var tempRace = new Race();
                            tempRace.name = "testRace3";
                            tempRace.status = "not_started";
                            tempRace.save(function (error, doc) 
                            {
                                if(error) return callback(error);
                                callback();
                            });
                        }
                    ], function(error)
                    {
                        if(error) done(error);
                        else done();
                    });
                },
                function(callback)
                {
                    Race.find({}, function(error, doc)
                    {
                        if (error) return callback(error);
                        databaseRaces = doc;
                        console.log(doc);
                        callback();
                    });
                },
                function(callback)
                {
                    var expectedCount = 3;
                    
                    makeGetRequest('/races', 200, function(err, res)
                    {
                        if(err) return callback(err);
                        
                        expect(res.body).to.have.property('races');
                        expect(res.body.races).to.be.an('array');
                        
                        var actualCounted = 0;
                        _.each(res.body.races, function(result)
                        {
                            expect(result).to.have.property('name');
                            expect(result.name).to.be.an('string');
                            expect(result.name).to.equal(databaseRaces[actualCounted].name);
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
});

describe('Testing /races/:name route', function()
{
    var testRaceData =
    {
        "name": 'testRace',
        "status": "not_started"
    };
    var testRace = new Race(testRaceData);
    
    var badRaceData =
    {
        "status": "not_started"
    };    
    
    var newRaceData = 
    {
        "name": "newRace",
        "status": "not_started"
    }
    
    var editRaceData = 
    {
        "name": "editRace",
        "status": "not_started"
    }
    
    before(function(done)
    {        
        testRace.save(function(err, savedRace)
        {
            if(err) return done(err);
            testRaceData._id = savedRace._id;
            done();
        });
    });
    
    describe('Testing /races/:id with positive results. GET', function()
    {
        it('should return Race data.', function(done)
        {
            makeGetRequest('/races/'+testRaceData._id, 200, function(err, res)
            {
                if(err) return done(err);
                
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('status');
                
                expect(res.body.name).to.equal(testRace.name);
                expect(res.body.status).to.equal(testRace.category);
                
                done();
            });
        });
    });
    describe('Testing /races/:id with negative results. GET', function()
    {
       it('should return HTTP 404 when no name matches a Race in the database.', function(done)
       {
           makeGetRequest('/races/nonexistingrace', 404, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/:id with positive results. PUT', function()
    {
       it('should change racedata from testrace to editRace.', function(done)
       {
           makePutRequest('/races/'+testRace._id, editRaceData, 200, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/:id with wrong reference. PUT', function()
    {
       it('should return 404.', function(done)
       {
           makePutRequest('/races/nonexistingrace', editRaceData, 404, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/:id with negative results. PUT', function()
    {
       it('should return 400.', function(done)
       {
           makePutRequest('/races/'+testRace._id, badRaceData, 400, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/ with positive results. POST', function()
    {
       it('should return 200.', function(done)
       {
           makePostRequest('/races/', newRaceData, 200, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/ with negative results. POST', function()
    {
       it('should return 400.', function(done)
       {
           makePostRequest('/races/', badRaceData, 400, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/ with positive results. DELETE', function()
    {
       it('should return 200.', function(done)
       {
           makeDeleteRequest('/races/'+testRace._id, 400, function(err, res)
           {
               if(err) return done(err);
               done();
           });
       });
    });
    describe('Testing /races/ with negative results. DELETE', function()
    {
       it('should return 404.', function(done)
       {
           makeDeleteRequest('/races/nonexistingrace', 404, function(err, res)
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
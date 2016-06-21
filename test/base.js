const User = require('../models/User');
const Venue = require('../models/Venue');
const Race = require('../models/Race');

const request = require('supertest');
const app = require('../app');

// define globals
// USERS
global.user = null;
global.admin = null;
global.goodUser1 = null;
global.goodUser2 = null;
global.goodUser3 = null;
global.wrongUser1 = null; //no name
global.wrongUser2 = null; //no email
global.wrongUser3 = null; //no password

// VENUES
global.goodVenue1 = null;
global.goodVenue2 = null;
global.goodVenue3 = null;
global.wrongVenue1 = null; //no name
global.wrongVenue2 = null; //no category

// RACES
global.goodRace1 = null;
global.goodRace2 = null;
global.goodRace3 = null;
global.wrongRace1 = null; //no name
global.wrongRace2 = null; //no status
global.wrongRace3 = null; //wrong status
global.wrongRace4 = null; //wrong venue
global.wrongRace5 = null; //wrong user in participants

var initUsers = function(){
    global.user = new User({
        name: 'testUser',
        group: 'user',
        local: 
        {
            email: "testUser@test.nl",
            password: "test"
        }
    });
    
    global.admin = new User({
        name: 'testAdmin',
        group: 'admin',
        local: 
        {
            email: "testAdmin@test.nl",
            password: "test"
        } 
    });
    
    global.goodUser1 = new User({
        name: 'goodUser 1',
        group: 'user',
        local: 
        {
            email: "goodUser1@test.nl",
            password: "test"
        }
    });
    
    global.goodUser2 = new User({
        name: 'goodUser 2',
        group: 'user',
        local: 
        {
            email: "goodUser2@test.nl",
            password: "test"
        }
    });
    
    global.goodUser3 = new User({
        name: 'goodUser 3',
        group: 'user',
        local: 
        {
            email: "goodUser3@test.nl",
            password: "test"
        }
    });
    
    //no name
    global.wrongUser1 = new User({
        group: 'user',
        local: 
        {
            email: "wrongUser1@test.nl",
            password: "test"
        }
    });
    
    //no email
    global.wrongUser2 = new User({
        name: 'wrongUser 2',
        group: 'user',
        local: 
        {
            password: "test"
        }
    });
    
    //no password
    global.wrongUser3 = new User({
        name: 'wrongUser 3',
        group: 'user',
        local: 
        {
            email: "goodUser3@test.nl"
        }
    });
    
    // global.venue = new Venue({
    //     name: "testVenue1",
    //     category: "testCategory1"
    // });
}

var initVenues = function(){
    global.goodVenue1 = new Venue({
        name: "goodVenue 1",
        category: "testCategory1"        
    });
    
    global.goodVenue2 = new Venue({
        name: "goodVenue 2",
        category: "testCategory2"        
    });
    
    global.goodVenue2 = new Venue({
        name: "goodVenue 1",
        category: "testCategory1"        
    });
    
    // no name
    global.wrongVenue1 = new Venue({
        category: "testCategory1"        
    });
    
    // no category
    global.goodVenue1 = new Venue({
        name: "goodVenue 1"       
    });
}

var initRaces = function(){
    global.goodRace1 = new Race({
        name: "goodRace 1",
        status: "not_started"
    });
    
    global.goodRace2 = new Race({
        name: "goodRace 2",
        status: "started"
    });
    
    global.goodRace3 = new Race({
        name: "goodRace 3",
        status: "ended"
    });
    
    // no name
    global.wrongRace1 = new Race({
        status: "not_started"
    });
    
    // no status 
    global.wrongRace2 = new Race({
        name: "wrongRace 2"
    });
    
    // wrong status
    global.wrongRace3 = new Race({
        name: "wrongRace 3",
        status: "testStatus"
    });
    
    // wrong venue
    global.wrongRace4 = new Race({
        name: "wrongRace 4",
        status: "not_started",
        venue: "not a venue"
    });
    
    // wrong user in participants
    global.wrongRace5 = new Race({
        name: "wrongRace 1",
        status: "not_started",
        participants: ["not a userId"]
    });
}

//setup database
//clear database after test

var init = function(){
    initUsers();
    initVenues();
    initRaces();
}

var fill = function(){
    
}

var clearDb = function(){
    // clearDb: new Promise(function (resolve, reject) {
    //     const config = require('../lib/config');

    //     // prevent testing on a production server
    //     if (config.production) {
    //         throw new Error("Can't test on a production server");
    //     }

    //     // clear the database
    //     co(function*() {

    //         var dbUrl = 'mongodb://';
    //         if (config.mongodb.username !== undefined && config.mongodb.password !== undefined) {
    //             dbUrl += config.mongodb.username + ':' + config.mongodb.password + '@';
    //         }
    //         dbUrl += config.mongodb.host + '/' + config.mongodb.database;

    //         // Connection URL
    //         var db = yield require('mongodb').MongoClient.connect(dbUrl);

    //         db.collections(function (err, collections) {
    //             for (var index in collections) {
    //                 var col = collections[index];
    //                 if (col.collectionName !== 'identitycounters') {
    //                     col.drop();
    //                 }
    //             }
    //             resolve();
    //         });
    //     }).catch(function (err) {
    //         console.log(err.stack);
    //         reject();
    //     });
    // })
}


// make sure to clear the database after the tests completed
before(function(done) {

    init.clearDb.then(function() {
        Promise.all([
            init.promiseClass,
            init.promiseGoal,
            init.promiseUser
        ]).then(function() {
            done();
        });
    });

});

global.makePostRequest = function (route, data, statusCode, requireLogin, done) {
    request(app)
        .post(route)
        .type('json')
        .send(data)
        .set('Accept', 'application/json')
        .set('x-token', requireLogin ? global.user.tokens[0].token : '')
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

global.makeGetRequest = function (route, statusCode, requireLogin, done) {
    request(app)
        .get(route)
        .type('json')
        .set('Accept', 'application/json')
        .set('x-token', requireLogin ? global.user.tokens[0].token : '')
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

global.makePutRequest = function (route, data, statusCode, requireLogin, done) {
    request(app)
        .put(route)
        .type('json')
        .send(data)
        .set('Accept', 'application/json')
        .set('x-token', requireLogin ? global.user.tokens[0].token : '')
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err, res);
            }

            done(null, res);
        });
};

global.makeDeleteRequest = function (route, statusCode, requireLogin, done) {
    request(app)
        .del(route)
        .type('json')
        .set('Accept', 'application/json')
        .set('x-token', requireLogin ? global.user.tokens[0].token : '')
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};
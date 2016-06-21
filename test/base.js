// "use strict";

// var mongoose = require('mongoose');
// var bcrypt   = require('bcrypt-nodejs');

// var mockgoose = require('mockgoose');
// mockgoose(mongoose);

// const User = require('../models/User')(mongoose, bcrypt);
// const Venue = require('../models/Venue')(mongoose);
// const Race = require('../models/Race')(mongoose);

// const request = require('supertest');
// const app = require('../app');
// const co = require('co');

// // define globals
// global.user = null;
// global.admin = null;
// global.venue = null;
// global.raceVenue = null;
// global.race = null;
// global.participant1 = null;
// global.participant2 = null;

// var init = {
//     promiseUser: new Promise(function (resolve, reject) {
//         global.user = new User({
//             name: 'testUser',
//             group: 'user',
//             local: 
//             {
//                 email: 'testuser@test.nl',
//                 password: 'test'
//             }
//         });

//         global.user.save(function (error, user) {
//             if (error) {
//                 console.log(error);
//                 reject();
//             }

//             resolve();
//         });
//     }),
//     promiseAdmin: new Promise(function (resolve, reject) {
//         global.admin = new User({
//             name: 'testAdmin',
//             group: 'admin',
//             local: 
//             {
//                 email: 'testadmin@test.nl',
//                 password: 'test'
//             }
//         });

//         global.admin.save(function (error, user) {
//             if (error) {
//                 console.log(error);
//                 reject();
//             }

//             resolve();
//         });
//     }),
//     promiseVenue: new Promise(function (resolve, reject) {
//         global.venue = new Venue({
//             name: "test venue",
//             category: "testing category"
//         });

//         global.venue.save(function (error, user) {
//             if (error) {
//                 console.log(error);
//                 reject();
//             }
//             resolve();
//         });
//     }),
//     promiseRace: new Promise(function (resolve, reject) {
//         let promiseParticipant1 = (global.participant1 = new User({
//             name: 'participant 1',
//             group: 'user',
//             local: {
//                 email: 'p1@test.nl',
//                 password: 'test'
//             }
//         })).save();

//         let promiseParticipant2 = (global.participant2 = new User({
//             name: 'participant 2',
//             group: 'user',
//             local: {
//                 email: 'p2@test.nl',
//                 password: 'test'
//             }
//         })).save();

//         Promise.all([
//             promiseParticipant1,
//             promiseParticipant2,
//             promiseRace
//         ]).then(function (data) {
//             global.participant1._id = data[0]._id;
//             global.participant2._id = data[1]._id;
            
//             let promiseRace = (global.race = new Race({
//                 name: 'test Race',
//                 status: 'not_started',
//                 venue: 6, //id in api.eet.nu
//                 participants: 
//                 [
//                     global.participant1._id,
//                     global.participant2._id
//                 ]
//             })).save();
            
//             Promise.all([
//                 promiseRace
//             ]).then(function(data){
//                 global.race._id = data[0]._id;
//             }).catch(function(){
//                 reject();
//             });
//         }).catch(function() {
//             reject();
//         });
//     }),
//     clearDb: new Promise(function (resolve, reject) {
//         this.timeout(30000);
//         mongoose.connect('');
//     })
// };

// // make sure to clear the database after the tests completed
// before(function(done) {
//     init.clearDb.then(function() {
//         Promise.all([
//             init.promiseUser,
//             init.promiseAdmin,
//             init.promiseVenue,
//             init.promiseRace
//         ]).then(function() {
//             done();
//         });
//     });
// });

// global.makePostRequest = function (route, data, statusCode, requireLogin, done) {
//     request(app)
//         .post(route)
//         .type('json')
//         .send(data)
//         .set('Content-Type', 'application/json')
//         .set('Authorization', 'Basic ' + btoa(global.admin.local.email + ":" + global.admin.local.password))
//         .expect(statusCode)
//         .end(function (err, res) {
//             if (err) {
//                 return done(err);
//             }

//             done(null, res);
//         });
// };

// global.makeGetRequest = function (route, statusCode, requireLogin, done) {
//     request(app)
//         .get(route)
//         .type('json')
//         .set('Content-Type', 'application/json')
//         .set('Authorization', 'Basic ' + btoa(global.admin.local.email + ":" + global.admin.local.password))
//         .expect(statusCode)
//         .end(function (err, res) {
//             if (err) {
//                 return done(err);
//             }

//             done(null, res);
//         });
// };

// global.makePutRequest = function (route, data, statusCode, requireLogin, done) {
//     request(app)
//         .put(route)
//         .type('json')
//         .send(data)
//         .set('Content-Type', 'application/json')
//         .set('Authorization', 'Basic ' + btoa(global.admin.local.email + ":" + global.admin.local.password))
//         .expect(statusCode)
//         .end(function (err, res) {
//             if (err) {
//                 return done(err, res);
//             }

//             done(null, res);
//         });
// };

// global.makeDeleteRequest = function (route, statusCode, requireLogin, done) {
//     request(app)
//         .del(route)
//         .type('json')
//         .set('Content-Type', 'application/json')
//         .set('Authorization', 'Basic ' + btoa(global.admin.local.email + ":" + global.admin.local.password))
//         .expect(statusCode)
//         .end(function (err, res) {
//             if (err) {
//                 return done(err);
//             }

//             done(null, res);
//         });
// };
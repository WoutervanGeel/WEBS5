// "use strict";

// var expect = require('chai').expect;

// // describe('POST /goals', function () {
// //     describe('with incorrect values', function(){
// //         describe('incorrect competentions', function(){
// //             it('should return fail reason', function (done) {

// //                 makePostRequest('/goals', {
// //                     "title": "Testdoel", 
// //                     "description": "Dit is een doel voor testdoeleinden", 
// //                     "userID": 2,
// //                     "warningDate": new Date("Wed May 25 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "endDate": new Date("Wed Jun 01 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "competentions": ["Sociaal", "Kaas"],
// //                     "mobileIcon": "ion-calculator"
// //                 }, 400, true, function (err, res) {
// //                     if (err) {
// //                         return done(err);
// //                     }

// //                     expect(res.body).to.have.property('msg');
// //                     expect(res.body.msg).to.have.property('message');
// //                     expect(res.body.msg.message).to.equal("Goal validation failed");
// //                     expect(res.body.msg).to.have.property('errors');
// //                     expect(res.body.msg.errors).to.have.property('competentions.1');
// //                     expect(res.body.msg.errors['competentions.1']).to.have.property('message');
// //                     expect(res.body.msg.errors['competentions.1'].message).to.equal("`Kaas` is not a valid enum value for path `competentions`.");
// //                     done();

// //                 });
// //             });
// //         });
// //         describe('title too short', function(){
// //             it('should return fail reason', function (done) {

// //                 makePostRequest('/goals', {
// //                     "title": "T", 
// //                     "description": "Dit is een doel voor testdoeleinden", 
// //                     "userID": 2,
// //                     "warningDate": new Date("Wed May 25 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "endDate": new Date("Wed Jun 01 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "competentions": ["Sociaal"],
// //                     "mobileIcon": "ion-calculator"
// //                 }, 400, true, function (err, res) {
// //                     if (err) {
// //                         return done(err);
// //                     }
                    
// //                     expect(res.body).to.have.property('msg');
// //                     expect(res.body.msg).to.have.property('message');
// //                     expect(res.body.msg.message).to.equal("Goal validation failed");
// //                     expect(res.body.msg).to.have.property('errors');
// //                     expect(res.body.msg.errors).to.have.property('title');
// //                     expect(res.body.msg.errors.title).to.have.property('message');
// //                     expect(res.body.msg.errors.title.message).to.equal("Title too short.");
// //                     done();

// //                 });
// //             });
// //         });
// //         describe('missing title', function(){
// //             it('should return fail reason', function (done) {

// //                 makePostRequest('/goals', {
// //                     "description": "Dit is een doel voor testdoeleinden", 
// //                     "userID": 2,
// //                     "warningDate": new Date("Wed May 25 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "endDate": new Date("Wed Jun 01 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "competentions": ["Sociaal"],
// //                     "mobileIcon": "ion-calculator"
// //                 }, 400, true, function (err, res) {
// //                     if (err) {
// //                         return done(err);
// //                     }

// //                     expect(res.body).to.have.property('message');
// //                     expect(res.body.message).to.equal("Missing parameters");
// //                     done();

// //                 });
// //             });
// //         });
// //         describe('endDate after warningDate', function(){
// //             it('should return fail reason', function (done) {

// //                 makePostRequest('/goals', {
// //                     "title": "Testdoel",
// //                     "description": "Dit is een doel voor testdoeleinden", 
// //                     "userID": 2,
// //                     "warningDate": new Date("Wed Jun 01 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "endDate": new Date("Wed May 25 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                     "competentions": ["Sociaal"],
// //                     "mobileIcon": "ion-calculator"
// //                 }, 400, true, function (err, res) {
// //                     if (err) {
// //                         return done(err);
// //                     }
                    
// //                     expect(res.body).to.have.property('msg');
// //                     expect(res.body.msg).to.equal("End date should be after warning date.");
// //                     done();

// //                 });
// //             });
// //         });
// //     });
// //     describe('with correct values', function(){
// //         it('should create a new goal', function (done) {

// //             makePostRequest('/goals', {
// //                 "title": "Testdoel", 
// //                 "description": "Dit is een doel voor testdoeleinden", 
// //                 "userID": 2,
// //                 "warningDate": new Date("Wed May 25 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                 "endDate": new Date("Wed Jun 01 2016 02:00:00 GMT+0200 (W. Europe Daylight Time)"),
// //                 "competentions": ["Sociaal"],
// //                 "mobileIcon": "ion-volume-high"
// //             }, 200, true, function (err, res) {
// //                 if (err) {
// //                     return done(err);
// //                 }

// //                 expect(res.body).to.have.property('msg');
// //                 expect(res.body.msg).to.equal("Post succes!");
// //                 done();

// //             });

// //         });
// //     });
// // });
// describe('GET /races', function () {
//     describe('without parameters', function(){
//         it('should return a list of all races', function (done) {

//             makeGetRequest('/races', 200, true, function (err, res) {
//                 if (err) {
//                     return done(err);
//                 }
                
//                 // expect(res.body).to.have.property('filter');
//                 // expect(res.body).to.have.property('data');
// 				expect(res.body.data).to.not.be.undefined;
// 				expect(res.body.filter).to.be.empty;
//                 done();

//             });

//         });
//     });
//     // describe('with correct parameters', function(){
//     //     it('should return a list of all goals with the done state "doing"', function (done) {

//     //         makeGetRequest('/goals?state=doing', 200, true, function (err, res) {
//     //             if (err) {
//     //                 return done(err);
//     //             }
                
//     //             expect(res.body).to.have.property('filter');
//     //             expect(res.body).to.have.property('data');
// 	// 			expect(res.body.filter).to.have.property('state');
//     //             expect(res.body.filter.state).to.equal("doing");
//     //             res.body.data.forEach(function(item){
//     //                 expect(item).to.have.property('_id');
//     //                 expect(item).to.have.property('title');
//     //                 expect(item).to.have.property('description');
//     //                 expect(item).to.have.property('userID');
//     //                 expect(item).to.have.property('warningDate');
//     //                 expect(item).to.have.property('endDate');
//     //                 expect(item).to.have.property('competentions');
//     //                 expect(item).to.have.property('motivation');
//     //                 expect(item).to.have.property('state');
//     //                 expect(item).to.have.property('steps');
//     //                 expect(item).to.have.property('startDate');
//     //                 expect(item.state).to.equal("doing");
//     //             });
//     //             done();

//     //         });

//     //     });
//     // });
// });
// // describe('GET /goals/:goalId', function () {
// //     describe('correct goalId', function(){
// //         it('should return a list of all goals', function (done) {

// //             makeGetRequest('/goals/' + global.goal._id, 200, true, function (err, res) {
// //                 if (err) {
// //                     return done(err);
// //                 }
                
// //                 expect(res.body).to.have.property('_id');
// //                 expect(res.body).to.have.property('title');
// //                 expect(res.body).to.have.property('description');
// //                 expect(res.body).to.have.property('userID');
// //                 expect(res.body).to.have.property('warningDate');
// //                 expect(res.body).to.have.property('endDate');
// //                 expect(res.body).to.have.property('competentions');
// //                 expect(res.body).to.have.property('motivation');
// //                 expect(res.body).to.have.property('state');
// //                 expect(res.body).to.have.property('steps');
// //                 expect(res.body).to.have.property('startDate');
// //                 expect(res.body._id).to.equal(global.goal._id);
// // 				expect(res.body.title).to.not.be.undefined;
// // 				expect(res.body.description).to.not.be.undefined;
// // 				expect(res.body.userID).to.not.be.undefined;
// // 				expect(res.body.warningDate).to.not.be.undefined;
// // 				expect(res.body.endDate).to.not.be.undefined;
// // 				expect(res.body.competentions).to.not.be.undefined;
// // 				expect(res.body.motivation).to.not.be.undefined;
// // 				expect(res.body.state).to.not.be.undefined;
// // 				expect(res.body.steps).to.not.be.undefined;
// // 				expect(res.body.startDate).to.not.be.undefined;
// //                 done();

// //             });

// //         });
// //     });
// //     describe('incorrect goalId', function(){
// //         it('should return fail reason', function (done) {

// //             makeGetRequest('/goals/-1', 404, true, function (err, res) {
// //                 if (err) {
// //                     return done(err);
// //                 }
                
// //                 expect(res.body).to.have.property('message');
// //                 expect(res.body.message).to.equal("Objects could not be resolved");
// //                 done();

// //             });

// //         });
// //     });
// // });
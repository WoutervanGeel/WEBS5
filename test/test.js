var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var app = require('../app');

function makePostRequest(route, data, statusCode, done) {
    request(app)
        .post(route)
        .type('json')
        .send(data)
        .set('Accept', 'application/json')
        .expect(statusCode)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }

            done(null, res);
        });
};

describe('POST /auth/login', function () {
    it('should log the user in', function (done) {

        makePostRequest('/auth/login', {
            username: 'frank3',
            password: 'test'
        }, 200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(res.body).to.have.property('success');
            expect(res.body.success).to.be.true;
            done();

        });

    })
});
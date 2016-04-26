"use strict";

var express = require('express');
var router = express.Router();
var passport = require('../lib/passport');
var models = {
    userId: require('../models/User'),
};

class Base {

    constructor(router) {
        //noinspection JSUnresolvedVariable
        this.router = router;
    }

    /**
     *
     * @param method
     * @param path
     * @param required
     * @param optional
     * @param callable
     * @param withAuthentication
     * @param router
     */
    regRoute(method, path, required, optional, callable, withAuthentication, router) {
        router = (router || this.router);
        let routerMethod = router[method];
        let args = [path];
        if (withAuthentication) {
            args.push(this._requireAuthentication);
        }
        args.push(function (request, response) {
            let params = this._get(required, optional, request);

            // invalid arguments for call
            if (params === false) {
                return response.status(400).json({
                    success: false,
                    message: 'Missing parameters'
                });
            }

            // resolve params
            this._resolveParams(params, function (error, params) {
                if (error) {
                    console.log(error);
                    return response.status(404).json({
                        success: false,
                        message: 'Objects could not be resolved'
                    });
                }

                callable(request, params, response);
            });
        }.bind(this));

        routerMethod.apply(router, args);
    }

    /**
     * Middleware to perform token authentication
     * @param req
     * @param res
     * @param next
     * @private
     */
    _requireAuthentication(req, res, next) {

        passport.authenticate('token', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Incorrect token credentials'
                });
            }

            req.user = user;
            next();
        })(req, res, next);

    }

    /**
     * Get a list of parameters from the request header
     * @param required
     * @param optional
     * @param req
     * @returns {*}
     * @private
     */
    _get(required, optional, req) {
        var fields = {};

        // get required fields
        for (var i in required) {
            let value = this._getField(req, required[i]);
            if (!value) {
                console.log(required[i], value);
                return false;
            }

            fields[required[i]] = value;
        }

        // get optional fields
        for (var i in optional) {
            fields[optional[i]] = this._getField(req, optional[i]);
        }

        return fields;
    }

    /**
     * Get a specific parameter from the request header
     * @param req
     * @param name
     * @returns {*}
     * @private
     */
    _getField(req, name) {
        return this._getFieldFromContext(req, name, 'body')
            || this._getFieldFromContext(req, name, 'params')
            || this._getFieldFromContext(req, name, 'query');
    }

    /**
     * Get a specific parameter from a specific part of the request header
     * @param req
     * @param name
     * @param context
     * @returns {*}
     * @private
     */
    _getFieldFromContext(req, name, context) {
        if (!req[context]) {
            return null;
        }

        let value = req[context][name];
        if (value) {
            return value;
        }
        return null;
    }

    /**
     * Resolve a parameter into the related object, if exists of course
     * @param params
     * @param callback
     * @private
     */
    _resolveParams(params, callback) {
        var promises = [];

        // prepare promises
        for (let name in params) {
            let value = params[name];

            if (value !== null && models[name]) {
                promises.push(this._promiseResolveParams(name, Number(value)));
            }
        }

        // if nothing has to be resolved
        if (promises.length == 0) {
            callback(null, params);
            return;
        }

        // if something needs to be resolved
        Promise.all(promises).then(function (data) {
            for (let index in data) {
                let key = data[index][0];
                let value = data[index][1];
                params[key] = value;
            }
            callback(null, params);
        }).catch(function (error) {
            callback(error, []);
        });
    }

    /**
     * Get a promise to resolve a specific parameter into the related object
     * @param type
     * @param id
     * @returns {Promise}
     * @private
     */
    _promiseResolveParams(type, id) {
        return new Promise(function (resolve, reject) {
            models[type].findOne({
                _id: id
            }, function (error, object) {
                if (error || !object) {
                    reject(error || {
                            description: 'Object reference not found'
                        });
                } else {
                    resolve([type, object]);
                }
            });
        });
    }
    
}

module.exports = Base;

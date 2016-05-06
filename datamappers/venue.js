var async = require('async');
var request = require('request');
var _ = require('underscore');
var Venue;
var domainURL;

var dataMapper =
{
    mapAllVenues: function(errorCallback, successCallback)
    {
        Venue.find({}, function(error, doc)
        {
            if(error) return errorCallback(error);
            
            if(doc.length == 0)
            {
                request(domainURL + '/venues', function(error, response, body) 
                {
                    var externalData = JSON.parse(body);
                    
                    _.each(externalData.results, function(result)
                    {
                        var venue = new Venue();
                        venue.name = result.name;
                        venue.index = result.id;
                        venue.category = result.category;
                        venue.isMapped = false; //Only true if fully mapped on first user access.
                        venue.save(function(error, savedVenue)
                        {
                            if(error) errorCallback(error);
                        });
                    });
                    successCallback();
                });
            }
            else successCallback();
        });
    },
    
    mapVenue: function(venue, errorCallback, successCallback)
    {
        var updatedData;
        async.series
        ([
            function(callback)
            {
                request(domainURL + '/venues/' + venue.index, function(error, response, body)
                {
                    if(error) return callback(error);
                    
                    var externalVenue = JSON.parse(body);
                    
                    updatedData = 
                    {
                          isMapped: true,
                          category: externalVenue.category
                    };
                    
                    return callback();
                });
            },
            function(callback)
            {
                venue.update(updatedData, function(error, numAffected)
                {
                    if(error) return callback(error);
                    callback();
                });
            }
        ], function(error)
        {
            if(error) return errorCallback(error);
            
            Venue.findOne({ name: venue.name }, function(err, doc)
            {
                
                var response =
                {
                    name: doc.get('name'),
                    category: doc.get('category')
                };
                successCallback(response);
            });
        });
    }
};

module.exports = function(mongoose, domain)
{
    Venue = mongoose.model('Venue');
    domainURL = domain;
    return dataMapper;
};
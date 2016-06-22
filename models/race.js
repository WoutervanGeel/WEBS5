function init(mongoose)
{
    var Schema = mongoose.Schema;

    var Participant = new Schema({
        id: {
            type: String,
            required: [true, 'Id is required.']
        },
        venues: [{
            type: String,
            required: [true, 'Venues is required.']
        }],
        winner: {
            type: Boolean,
            required: [true, 'Winner is required.'],
            default: false
        },
    });

    var raceSchema = new Schema
    ({
        name:
        {
            type: String,
            required: [true, 'Name is required.']
        },
        status:
        {
            //type: statusSchema  
            type: String,
            enum: ['not_started', 'started', 'ended'],
            required: [true, 'Status is required.']
        },
        venues: {
            type: [{
                type: String,
                ref: "Venue",
                required: true
            }]
        },
        participants: {
                type: [Participant]
        }
    });
    
    raceSchema.statics.findByName = function (name, callback) {
        return this.findOne({name: name}, function(err, race){
            if(race == null){
                callback(err, race);
            } else {
                var resultRace = 
                {
                    name: race.name,
                    participants: [],
                    status: race.status,
                    venues: null
                }
                if(race.venue == undefined || race.venue == null){
                    if(race.participants.length > 0){
                        _getParticipantsFromCollection(race.participants, function(err, list){
                            resultRace.participants = list;
                            console.log("resultRace: ", resultRace);
                            callback(err, resultRace);
                        });
                    } else {
                        callback(err, resultRace);
                    }
                } else {
                    Venue.findByName(race.venue, function(err, resultVenue){
                        resultRace.venue = resultVenue;
                        if(race.participants.length != 0){
                            _getParticipantsFromCollection(race.participants, function(err, list){
                                resultRace.participants = list;
                                callback(err, resultRace);
                            });
                        } else {
                            callback(err, resultRace);
                        }
                    });
                }
            }
        });
    };
    
    _getParticipantsFromCollection = function (participants, callback){
        var tempList = [];
        var userCallback = function(err, name){
            tempList.push(name); 
            if(tempList.length == participants.length){
                callback(err, tempList);
            }
        }
        for(part in participants){
            User.getName(participants[part], userCallback);
        }
    }
    
    raceSchema.statics.getParticipants = function (name, callback) {
        return this.find({name: name}, function(err, race){
            var tempRace = race[0];
            var result = {
                participants: []
            };
            _getParticipantsFromCollection(tempRace.participants, function(err, list){
                result.participants = list;
                callback(err, result);
            });
        });
    }
    
    mongoose.model('Race', raceSchema);
};

module.exports = init;
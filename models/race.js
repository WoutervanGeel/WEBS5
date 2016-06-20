function init(mongoose)
{
    var Schema = mongoose.Schema;
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
        venue: {
            type: String,
            ref: "Venue",
            required: false
        }, 
        participants: {
            type: [{
                type: String,
                ref: "User",
                required: [true, 'User Id is required.']
            }]
        }
    });
    
    raceSchema.statics.findByName = function (name, callback) {
        return this.findOne({name: name}, function(err, race){
            if(race == null){
                callback(err, race);
            } else {
                Venue.findByName(race.venue, function(err, resultVenue){
                    var resultRace = 
                    {
                        name: race.name,
                        participants: [],
                        status: race.status,
                        venue: resultVenue[0]
                    }
                    _getParticipantsFromCollection(race.participants, function(err, list){
                        resultRace.participants = list;
                        callback(err, resultRace);
                    });
                });
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
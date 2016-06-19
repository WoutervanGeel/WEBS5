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
        }
    });
    
    raceSchema.statics.findByName = function (name, callback) {
        return this.find({name: name}, function(err, race){
            tempRace = race[0];
            Venue.findByName(tempRace.venue, function(err, resultVenue){
                
                var resultRace = 
                {
                    name: tempRace.name,
                    status: tempRace.status,
                    venue: resultVenue[0]
                }
                callback(err, resultRace);
            });
        });
    };
    
    mongoose.model('Race', raceSchema);
};

module.exports = init;
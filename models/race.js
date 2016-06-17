function init(mongoose)
{
    var Schema = mongoose.Schema;
    
    var venueSchema = new Schema
    ({
        index:
        {
            type: Number
        },
        name:
        {
            type: String,
            required: [true, 'Name is required.']
        },
        category: 
        {
            type: String
        },
        isMapped:
        {
            type: Boolean
        }
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
        venue: 
        {
            type: venueSchema
        }
    });
    
    raceSchema.statics.getData = function() {
        return {
            name: this.name,
            venue: this.venue.getBasicData()
        };
    };
    
    mongoose.model('Race', raceSchema);
};

module.exports = init;
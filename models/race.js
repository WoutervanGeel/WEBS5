function init(mongoose)
{
    var Schema = mongoose.Schema;
    
    var statusSchema = new Schema
    ({
        status:
        {
            type: String,
            enum: ['not_started', 'started', 'ended'],
            required: [true, 'Status is required.']
        }
    });
    var venueSchema = new Schema
    ({
        index:
        {
            type: Number,
            index: { unique: true }
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
        index:
        {
            type: Number,
            index: { unique: true }
        },
        name:
        {
            type: String,
            required: [true, 'Name is required.']
        },
        status:
        {
            type: statusSchema  
        },
        venues: 
        {
            type: [venueSchema]
        }
    });
    
    mongoose.model('Race', raceSchema);
};

module.exports = init;
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
    
    mongoose.model('Venue', venueSchema);
};

module.exports = init;
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
    
    venueSchema.statics.getBasicData = function () {
        return {
            _id: this._id,
            name: this.name,
            category: this.category
        };
    };
    
    venueSchema.statics.findByName = function (name, callback) {
        return this.find({name: name}, callback);
    };
    
    mongoose.model('Venue', venueSchema);
};


module.exports = init;
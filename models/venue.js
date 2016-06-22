function init(mongoose)
{
    var Schema = mongoose.Schema;
    
    var venueSchema = new Schema
    ({
        id:
        {
            type: String,
            required: [true, 'Id is required.']
        },
        name:
        {
            type: String,
            required: [true, 'Name is required.']
        },
        category: 
        {
            type: String
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
        return this.findOne({name: name}, callback);
    };
    
    mongoose.model('Venue', venueSchema);
};


module.exports = init;
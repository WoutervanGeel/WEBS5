// var mongoose = require('mongoose');
// var bcrypt   = require('bcrypt-nodejs');
function init(mongoose, bcrypt)
{
    var Schema = mongoose.Schema;
    var userSchema = new Schema
    ({
        
        group: String,
            local: {
                email: String,
                password: String,
            },
            facebook: {
                id: String,
                token: String,
                email: String,
                name: String
            },
            twitter: {
                id: String,
                token: String,
                displayName: String,
                username: String
            },
           google: {
                id: String,
                token: String,
                email: String,
                name: String
            }
    });
    
    // methods ======================
    // generating a hash
    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    userSchema.statics.getLatestId = function () {
        latestId = 0;
        this.find({}, function(err, race){
            console.log(race.id);
            if(latestId < race.id){
                latestId = race.id
            }
        });
        //userSchema.static.latestId = userSchema.static.latestId + 1;
        return latestId;
    }
    
    mongoose.model('User', userSchema);
};

module.exports = init;
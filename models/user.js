// var mongoose = require('mongoose');
// var bcrypt   = require('bcrypt-nodejs');
function init(mongoose, bcrypt)
{
    var Schema = mongoose.Schema;
    var userSchema = new Schema
    ({
        name: String,
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
    
    userSchema.statics.getName = function (id, callback) {
        return this.find({_id:id}, function(err, user){
            callback(err, user[0].name);
        });
    };
    
    userSchema.methods.isAdmin = function() {
        return this.group == "admin";
    };
    
    mongoose.model('User', userSchema);
};

module.exports = init;
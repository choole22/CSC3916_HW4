var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


mongoose.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//Actor schema
var ActorSchema = new Schema({
    ActorName: String,
    CharacterName: String
});

ActorSchema.pre('save', function(next) {
    return next();
});

//return the model to server
module.exports = mongoose.model('Actor', ActorSchema);

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

//review schema
var ReviewSchema = new Schema({
    User: String,
    Title: String,
    Comment: String
});

ReviewSchema.pre('save', function(next) {
    return next();
});

//return the model to server
module.exports = mongoose.model('Review', ReviewSchema);

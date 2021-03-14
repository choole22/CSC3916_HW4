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

//movie schema
var MovieSchema = new Schema({
    Title: String,
    Genre: String,
    Year:  String,
    Actor_1: String,
    Actor_2: String,
    Actor_3: String
});

MovieSchema.pre('save', function() {
    var movie = this;
});

//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);
